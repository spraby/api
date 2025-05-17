<?php

namespace App\Console\Commands\Seeds;

use App\Models\Brand;
use App\Models\BrandSettings;
use Illuminate\Console\Command;

class SeedBrandSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:brand:settings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for generate default values';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->generate();
    }

    /**
     * @return void
     */
    public function generate(): void
    {
        $data = [
            [
                'type' => BrandSettings::TYPES['REFUND'],
                'value' => [
                    'description' => '<p><strong>Возврат и обмен:</strong> Покупатели могут вернуть или обменять товар в течение 30 дней после получения, если товар не использовался и сохранен в оригинальной упаковке. </p><p>Кроме этого, для нас важно оказывать по-настоящему качественный сервис.</p><p>Поэтому любой ремонт, замену или возврат мы сделаем без бюрократических процедур. </p><p>Вы просто приходите к нам в бутик, пишите на почту, в инстаграм или мессенджер, и мы все оформим. </p><p>В случае производственного брака все расходы на доставку мы берём на себя.</p>'
                ]
            ],
            [
                'type' => BrandSettings::TYPES['ADDRESSES'],
                'value' => [
                    "<p>адрес магаза 1</p><p><br></p><p>адрес 2</p><p><br></p><p>адрес 3</p>"
                ]
            ],
            [
                'type' => BrandSettings::TYPES['DELIVERY'],
                'value' => [
                    'description' => '<p><strong>Бесплатная доставка:</strong> Предлагаем бесплатную стандартную доставку на заказы от 3000 рублей.</p><p>Срок доставки составляет 3-5 рабочих дней в зависимости от региона.</p><p>Для заказов меньше 3000 рублей стоимость доставки составит 500 рублей.</p><p><br></p><p><strong>Экспресс-доставка: </strong>Доступна за дополнительную плату в размере 800 рублей.</p><p>Заказы, оформленные до 14:00, будут доставлены на следующий рабочий день.</p><p><br></p><p><strong>Международная доставка:</strong> Мы отправляем заказы в более чем 50 стран.</p><p>Стоимость и сроки международной доставки зависят от страны назначения и рассчитываются при оформлении заказа.</p><p><br></p><p><strong>Самовывоз:</strong> Заказ можно забрать самостоятельно в одном из наших магазинов в течение 7 рабочих дней после подтверждения заказа.</p>'
                ]
            ],
            [
                'type' => BrandSettings::TYPES['PHONES'],
                'value' => [
                    ["+34 34 345-34-54"]
                ]
            ],
            [
                'type' => BrandSettings::TYPES['EMAILS'],
                'value' => ["bestmail@gmail.com"]
            ],
            [
                'type' => BrandSettings::TYPES['SOCIALS'],
                'value' => [
                    [
                        "link" => "6282236721377",
                        "type" => "whatsapp"
                    ],
                    [
                        "link" => "mike13s",
                        "type" => "telegram"
                    ],
                    [
                        "link" => "mikhail_sevruk",
                        "type" => "instagram"
                    ]
                ]
            ]
        ];

        Brand::cursor()->each(function ($brand) use ($data) {

            foreach ($data as $dataItem ) {
                BrandSettings::updateOrCreate([
                    'type' => $dataItem['type'],
                    'brand_id' => $brand->id
                ], [
                    'data' => $dataItem['value'],
                ]);
            }
        });
    }
}
