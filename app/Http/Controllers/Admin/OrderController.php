<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Order;
use App\Models\OrderShipping;
use App\Models\User;
use App\Services\Orders\OrderShippingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    private const ORDER_HISTORY_LIMIT = 10;
    private const ORDER_HISTORY_STEP = 10;

    /**
     * Show the orders list page with orders data.
     */
    public function index(): Response
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        $perPage = (int) request()->query('per_page', 10);
        $allowedPerPage = [10, 20, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $search = trim((string) request()->query('search', ''));
        $status = (string) request()->query('status', '');
        $financialStatus = (string) request()->query('financial_status', '');

        if (! $brand) {
            return Inertia::render('Orders', [
                'orders' => [],
                'pagination' => [
                    'page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'last_page' => 1,
                ],
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'financial_status' => $financialStatus,
                ],
                'error' => 'No brand associated with user',
            ]);
        }

        $itemsSub = DB::table('order_items')
            ->selectRaw('order_id')
            ->selectRaw('COUNT(*) as items_count')
            ->selectRaw('COALESCE(SUM(final_price * quantity), 0) as total')
            ->groupBy('order_id');

        $ordersQuery = DB::table('orders as o')
            ->leftJoinSub($itemsSub, 'oi', 'oi.order_id', '=', 'o.id')
            ->leftJoin('customers as c', 'c.id', '=', 'o.customer_id')
            ->where('o.brand_id', $brand->id)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('o.name', 'ilike', '%'.$search.'%');
            })
            ->when($status !== '', function ($query) use ($status) {
                $query->where('o.status', $status);
            })
            ->when($financialStatus !== '', function ($query) use ($financialStatus) {
                $query->where('o.financial_status', $financialStatus);
            })
            ->orderByDesc('o.created_at')
            ->selectRaw('o.id, o.name, o.status, o.delivery_status, o.financial_status, o.note, o.created_at, o.customer_id')
            ->selectRaw('COALESCE(oi.items_count, 0) as items_count')
            // o.total — финансовый снапшот заказа (товары + доставка);
            // для старых заказов без снапшота — сумма позиций на лету
            ->selectRaw('COALESCE(o.total, oi.total, 0) as total')
            ->selectRaw('c.name as customer_name')
            ->selectRaw('c.email as customer_email')
            ->selectRaw('c.phone as customer_phone');

        $paginator = $ordersQuery->paginate($perPage)->withQueryString();

        $orders = $paginator->getCollection()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->name,
                    'status' => $row->status,
                    'delivery_status' => $row->delivery_status,
                    'financial_status' => $row->financial_status,
                    'note' => $row->note,
                    'customer' => $row->customer_id ? [
                        'id' => $row->customer_id,
                        'name' => $row->customer_name,
                        'email' => $row->customer_email,
                        'phone' => $row->customer_phone,
                    ] : null,
                    'items_count' => (int) $row->items_count,
                    'total' => (float) $row->total,
                    'created_at' => Carbon::parse($row->created_at)->toISOString(),
                ];
            })
            ->values();

        return Inertia::render('Orders', [
            'orders' => $orders,
            'pagination' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'financial_status' => $financialStatus,
            ],
        ]);
    }

    /**
     * Show the order detail page.
     */
    public function show(
        Request $request,
        Order $order,
        OrderShippingService $orderShippingService,
    ): Response|RedirectResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        // Verify ownership
        if (!$brand || $order->brand_id !== $brand->id) {
            return redirect()->route('admin.orders');
        }

        // Load relationships
        $order->load([
            'customer',
            'orderItems.product.images.image',
            'orderItems.variant.image.image',
            'orderItems.image.image',
            'orderShippings',
        ]);

        $auditsQuery = $order->audits()
            ->with('user')
            ->orderBy('created_at', 'desc');
        $auditsTotal = (clone $auditsQuery)->count();
        $auditsLimit = self::ORDER_HISTORY_LIMIT;

        if ($request->header('X-Inertia') && $request->has('history_limit')) {
            $auditsLimit = max(self::ORDER_HISTORY_LIMIT, (int) $request->query('history_limit'));
            $auditsLimit = min($auditsLimit, max($auditsTotal, self::ORDER_HISTORY_LIMIT));
        }

        // Load audits with user
        $audits = $auditsQuery
            ->limit($auditsLimit)
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'event' => $audit->event,
                    'message' => $audit->message,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'user' => $audit->user ? [
                        'id' => $audit->user->id,
                        'name' => $audit->user->name,
                        'email' => $audit->user->email,
                    ] : null,
                    'created_at' => $audit->created_at->toISOString(),
                ];
            });

        // Map order data
        $orderData = [
            'id' => $order->id,
            'name' => $order->name,
            'status' => $order->status,
            'delivery_status' => $order->delivery_status,
            'financial_status' => $order->financial_status,
            'note' => $order->note,
            'status_url' => $order->status_url,
            // Финансовый снапшот; NULL — старый заказ, фронт считает из позиций.
            // shipping_price NULL при заполненном total — «стоимость согласуется»
            'subtotal' => $order->subtotal,
            'discount_total' => $order->discount_total,
            'shipping_price' => $order->shipping_price,
            'total' => $order->total,
            'created_at' => $order->created_at->toISOString(),
            'updated_at' => $order->updated_at->toISOString(),
            'customer' => $order->customer ? [
                'id' => $order->customer->id,
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'phone' => $order->customer->phone,
            ] : null,
            'order_items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'variant_title' => $item->variant_title,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'price' => (string) $item->price,
                    'final_price' => (string) $item->final_price,
                    'image_url' => $item->imageUrl,
                ];
            }),
            'order_shippings' => $order->orderShippings->map(function ($shipping) use ($orderShippingService) {
                return [
                    'id' => $shipping->id,
                    'name' => $shipping->name,
                    'phone' => $shipping->phone,
                    'note' => $shipping->note,
                    'shipping_method_id' => $shipping->shipping_method_id,
                    'shipping_method_name' => $shipping->shipping_method_name,
                    // customer_settings пишутся витриной со слов клиента — форму
                    // гарантируем здесь, чтобы кривой JSON не ронял страницу заказа.
                    'customer_settings' => $orderShippingService->normalizeCustomerSettings($shipping->customer_settings),
                ];
            }),
        ];

        $shippingMethods = $brand->shippingMethods()
            ->with('methodConstructor')
            ->get()
            ->filter(fn ($method) => filled($method->methodConstructor?->name))
            ->sortBy(fn ($method) => $method->methodConstructor->name)
            ->map(fn ($method) => [
                'id' => $method->id,
                'name' => $method->methodConstructor->name,
                'customer_settings' => $orderShippingService->normalizeCustomerSettings($method->customer_settings),
            ])
            ->values();

        return Inertia::render('OrderShow', [
            'order' => $orderData,
            'audits' => $audits,
            'auditsTotal' => $auditsTotal,
            'auditsLimit' => $auditsLimit,
            'historyStep' => self::ORDER_HISTORY_STEP,
            'shippingMethods' => $shippingMethods,
        ]);
    }

    /**
     * Update order status fields.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        // Verify ownership
        if (!$brand || $order->brand_id !== $brand->id) {
            return redirect()->route('admin.orders');
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,processing,completed,cancelled,archived',
            'delivery_status' => 'sometimes|in:pending,packing,shipped,transit,delivered',
            'financial_status' => 'sometimes|in:unpaid,paid,partial_paid,refunded',
        ]);

        $order->update($validated);

        return redirect()->back();
    }

    /**
     * Проставить стоимость доставки, когда она «согласуется с продавцом»
     * (или скорректировать по договорённости). total пересчитывается,
     * subtotal/discount_total остаются снапшотом момента заказа.
     */
    public function updateShippingPrice(
        Request $request,
        Order $order,
        OrderShippingService $orderShippingService,
    ): RedirectResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (!$brand || $order->brand_id !== $brand->id) {
            return redirect()->route('admin.orders');
        }

        $validated = $request->validate([
            'shipping_price' => 'nullable|numeric|min:0|max:99999999',
        ]);

        $orderShippingService->updateShippingPrice($order, $validated['shipping_price'] ?? null);

        return redirect()->back();
    }

    /**
     * Update the delivery snapshot attached to an order.
     */
    public function updateShipping(
        Request $request,
        Order $order,
        OrderShipping $shipping,
        OrderShippingService $orderShippingService,
    ): RedirectResponse
    {
        /**
         * @var User $user
         * @var Brand $brand
         */
        $user = auth()->user();
        $brand = $user->getBrand();

        if (! $brand || $order->brand_id !== $brand->id || $shipping->order_id !== $order->id) {
            return redirect()->route('admin.orders');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['present', 'nullable', 'string', 'max:255'],
            'note' => ['present', 'nullable', 'string', 'max:2000'],
            'shipping_method_id' => ['present', 'nullable', 'integer'],
            'customer_settings' => ['present', 'array'],
            'customer_settings.*.key' => ['required', 'string', 'max:255'],
            'customer_settings.*.name' => ['required', 'string', 'max:255'],
            'customer_settings.*.type' => ['nullable', 'string', 'max:50'],
            'customer_settings.*.value' => ['nullable'],
        ]);

        $shippingMethod = null;
        $shippingMethodId = $validated['shipping_method_id'];

        if ($shippingMethodId !== null) {
            $shippingMethod = $brand->shippingMethods()
                ->with('methodConstructor')
                ->whereKey($shippingMethodId)
                ->first();

            if (! $shippingMethod) {
                throw ValidationException::withMessages([
                    'shipping_method_id' => __('validation.exists', ['attribute' => 'shipping_method_id']),
                ]);
            }
        }

        $orderShippingService->updateShipping($order, $shipping, $validated, $shippingMethod);

        return redirect()->back();
    }
}
