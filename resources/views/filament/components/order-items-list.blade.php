@php
    use App\Models\Order;
    use App\Models\OrderItem;
    use App\Models\Brand;

    /**
    * @var Order $order
    * @var OrderItem $orderItem
    * @var Brand $brand
    */
    $state = $getState();
    $order = $state['order'];
    $brand = $order->brand;
@endphp

<div class="flex flex-col gap-5">
    @foreach ($order->orderItems as $orderItem)
        <div class="flex gap-5">
            <div class="min-w-[50px] w-[70px] h-[70px] border border-gray-200 rounded-md">
                <img class="w-full h-full object-contain" src="{{$orderItem->image->image->url}}" alt="">
            </div>
            <div class="">
                <a href="/admin/products/{{$orderItem->product->id}}/edit" target="_blank">{{$orderItem->title}}
                    <x-copyable :text="$orderItem->title"/>
                </a>
                <div>
                    <div>
                        <span class="text-sm">Price: </span><span>{{$brand->toMoney($orderItem->price)}}</span>
                    </div>
                    <div>
                        <span class="text-sm">Quantity: </span><span>{{$orderItem->quantity}}</span>
                    </div>
                </div>
            </div>
        </div>
    @endforeach
</div>
