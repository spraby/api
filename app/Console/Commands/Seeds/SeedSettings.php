<?php

namespace App\Console\Commands\Seeds;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Settings;
use Illuminate\Console\Command;

class SeedSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:settings';

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
        $this->generateMenu();
        $this->generateInformation();
    }

    public function generateInformation(): void
    {
        $description = '<p><span style=\"color: rgb(0, 0, 0);\">Портал </span><strong style=\"color: rgb(0, 0, 0);\">SPRA.BY</strong><span style=\"color: rgb(0, 0, 0);\"> не является интернет-магазином, приобретение товара осуществляется напрямую у ремесленника, юридического лица или в стационарном торговом объекте по указанному адресу продавца. </span></p><p><br></p><p><span style=\"color: rgb(0, 0, 0);\">Информация о товарах на портале </span><strong style=\"color: rgb(0, 0, 0);\">SPRA.BY</strong><span style=\"color: rgb(0, 0, 0);\"> носит справочный характер и не является публичной офертой. Указанная цена на товары может отличаться от фактической. Если в описании или цене вы заметили неточность или ошибку, пожалуйста, сообщите нам на почту help@spra.by</span></p>';

        Settings::updateOrCreate([
            'key' => Settings::KEYS['INFO'],
        ], [
            'data' => [
                'description' => $description,
            ],
        ]);
    }

    private function generateMenu(): void
    {
        $menu = [];
        $scheme = $this->getScheme();

        foreach ($scheme['collections'] as $collection) {
            $data = $this->generateCollectionForMenu($collection);
            if ($data) {
                $menu[] = $data;
            }
        }

        /**
         * @var Settings $settings
         */
        $settings = Settings::menu()->first();
        if (! $settings) {
            Settings::createMenu($menu);
        } else {
            $settings->data = $menu;
            $settings->save();
        }
    }

    private function generateCollectionForMenu(array $collection): ?array
    {
        $dbCollection = Collection::where('handle', $collection['id'])->where('name', $collection['name'])->first();

        if (! $dbCollection) {
            return null;
        }

        $collectionData = [
            'id' => $dbCollection->id,
            'url' => "/collections/{$dbCollection->handle}",
            'title' => $dbCollection->name,
        ];

        $childrenCollections = [];
        if (isset($collection['subCollections'])) {
            foreach ($collection['subCollections'] as $subCollections) {
                $data = $this->generateCollectionForMenu($subCollections);
                if ($data) {
                    $childrenCollections[] = $data;
                }
            }
        }

        $childrenCategories = [];
        if (isset($collection['categories'])) {
            foreach ($collection['categories'] as $category) {
                $dbCategory = Category::where('handle', $category['id'])->where('name', $category['name'])->first();
                $childrenCategories[] = [
                    'id' => $dbCategory->id,
                    'title' => $dbCategory->name,
                    'url' => "/categories/{$dbCategory->handle}",
                ];
            }
        }

        if (count($childrenCategories) || count($childrenCollections)) {
            $collectionData['children'] = array_merge($childrenCollections, $childrenCategories);
        }

        return $collectionData;
    }

    /**
     * @return void
     */
    private function getScheme()
    {
        return json_decode('{
    "collections": [
      {
        "id": "clothes",
        "name": "Одежда",
        "type": "collection",
        "subCollections": [
          {
            "id": "women",
            "name": "Для женщин",
            "type": "collection",
            "categories": [
              {
                "id": "dresses",
                "name": "Платья и сарафаны",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "pantsAndSkirts",
                "name": "Брюки и юбки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "knitwear",
                "name": "Вязаные изделия (свитера, кардиганы)",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "headwear",
                "name": "Головные уборы",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "socks",
                "name": "Носки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "mittens",
                "name": "Варежки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "gloves",
                "name": "Перчатки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              }
            ]
          },
          {
            "id": "men",
            "name": "Для мужчин",
            "type": "collection",
            "categories": [
              {
                "id": "pantsAndShorts",
                "name": "Брюки и шорты",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "knitwear",
                "name": "Вязаные изделия (свитера, кардиганы)",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "headwear",
                "name": "Головные уборы",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "socks",
                "name": "Носки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "mittens",
                "name": "Варежки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "gloves",
                "name": "Перчатки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              }
            ]
          },
          {
            "id": "kids",
            "name": "Для детей",
            "type": "collection",
            "categories": [
              {
                "id": "dresses",
                "name": "Платья и сарафаны",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "pantsAndSkirts",
                "name": "Брюки и юбки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "knitwear",
                "name": "Вязаные изделия (свитера, кардиганы)",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "headwear",
                "name": "Головные уборы",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "socks",
                "name": "Носки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "mittens",
                "name": "Варежки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              },
              {
                "id": "gloves",
                "name": "Перчатки",
                "type": "category",
                "filters": [
                  {
                    "id": "size",
                    "type": "multi-select",
                    "options": [
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "One size",
                      "Oversize"
                    ]
                  },
                  {
                    "id": "color",
                    "type": "multi-select",
                    "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
                  },
                  {
                    "id": "material",
                    "type": "multi-select",
                    "options": ["Хлопок", "Лён", "Шерсть", "Шёлк"]
                  },
                  {
                    "id": "season",
                    "type": "multi-select",
                    "options": ["Лето", "Зима", "Деми"]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "accessories",
        "name": "Аксессуары",
        "type": "collection",
        "categories": [
          {
            "id": "bracelets",
            "name": "Браслеты",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "earrings",
            "name": "Серьги",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "rings",
            "name": "Кольца",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "bijouterie",
            "name": "Бижутерия",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "bags",
            "name": "Сумки и рюкзаки",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "belts",
            "name": "Ремни",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "wallets",
            "name": "Кошельки и портмоне",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          },
          {
            "id": "scarves",
            "name": "Шарфы и платки",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Кожа", "Текстиль", "Металл", "Дерево"]
              },
              {
                "id": "color",
                "type": "multi-select",
                "options": ["Красный", "Синий", "Зелёный", "Чёрный", "Белый"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Классика", "Бохо", "Минимализм", "Спорт"]
              }
            ]
          }
        ]
      },
      {
        "id": "ceramics",
        "name": "Керамика",
        "type": "collection",
        "categories": [
          {
            "id": "plates",
            "name": "Тарелки",
            "type": "category",
            "filters": [
              {
                "id": "ceramicType",
                "type": "single-select",
                "options": [
                  "Фаянс",
                  "Фарфор",
                  "Гончарная керамика",
                  "Каменная керамика"
                ]
              },
              {
                "id": "glaze",
                "type": "single-select",
                "options": ["Матовая", "Глянцевая", "Без глазури"]
              },
              {
                "id": "handPainting",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "cups",
            "name": "Кружки",
            "type": "category",
            "filters": [
              {
                "id": "ceramicType",
                "type": "single-select",
                "options": [
                  "Фаянс",
                  "Фарфор",
                  "Гончарная керамика",
                  "Каменная керамика"
                ]
              },
              {
                "id": "glaze",
                "type": "single-select",
                "options": ["Матовая", "Глянцевая", "Без глазури"]
              },
              {
                "id": "handPainting",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "bowls",
            "name": "Миски",
            "type": "category",
            "filters": [
              {
                "id": "ceramicType",
                "type": "single-select",
                "options": [
                  "Фаянс",
                  "Фарфор",
                  "Гончарная керамика",
                  "Каменная керамика"
                ]
              },
              {
                "id": "glaze",
                "type": "single-select",
                "options": ["Матовая", "Глянцевая", "Без глазури"]
              },
              {
                "id": "handPainting",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "decor",
            "name": "Декор (вазы, статуэтки)",
            "type": "category",
            "filters": [
              {
                "id": "ceramicType",
                "type": "single-select",
                "options": [
                  "Фаянс",
                  "Фарфор",
                  "Гончарная керамика",
                  "Каменная керамика"
                ]
              },
              {
                "id": "glaze",
                "type": "single-select",
                "options": ["Матовая", "Глянцевая", "Без глазури"]
              },
              {
                "id": "handPainting",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "ceramicJewelry",
            "name": "Украшения из керамики",
            "type": "category",
            "filters": [
              {
                "id": "ceramicType",
                "type": "single-select",
                "options": [
                  "Фаянс",
                  "Фарфор",
                  "Гончарная керамика",
                  "Камення керамика"
                ]
              },
              {
                "id": "glaze",
                "type": "single-select",
                "options": ["Матовая", "Глянцевая", "Без глазури"]
              },
              {
                "id": "handPainting",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "planters",
            "name": "Горшки и кашпо",
            "type": "category",
            "filters": [
              {
                "id": "ceramicType",
                "type": "single-select",
                "options": [
                  "Фаянс",
                  "Фарфор",
                  "Гончарная керамика",
                  "Каменная керамика"
                ]
              },
              {
                "id": "glaze",
                "type": "single-select",
                "options": ["Матовая", "Глянцевая", "Без глазури"]
              },
              {
                "id": "handPainting",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          }
        ]
      },
      {
        "id": "food",
        "name": "Еда",
        "type": "collection",
        "categories": [
          {
            "id": "bread",
            "name": "Хлеб",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "pies",
            "name": "Пироги",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "cookies",
            "name": "Печенье",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "sweets",
            "name": "Сладости (конфеты, шоколад)",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "honeyAndJams",
            "name": "Мёд и варенье",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "pickles",
            "name": "Соленья",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "herbsAndSpices",
            "name": "Травы и специи",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "tea",
            "name": "Чай",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "coffee",
            "name": "Кофе",
            "type": "category",
            "filters": [
              {
                "id": "organic",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "dietType",
                "type": "multi-select",
                "options": ["Веган", "Вегетарианская", "Безглютеновая", "Без сахара"]
              },
              {
                "id": "shelfLife",
                "type": "range",
                "options": []
              }
            ]
          }
        ]
      },
      {
        "id": "home",
        "name": "Дом",
        "type": "collection",
        "categories": [
          {
            "id": "pillows",
            "name": "Подушки",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "blankets",
            "name": "Пледы",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "towels",
            "name": "Полотенца",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "candles",
            "name": "Свечи и ароматизаторы",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "decorItems",
            "name": "Декор (панно, постеры, фигурки)",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "furniture",
            "name": "Мебель ручной работы",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "lighting",
            "name": "Светильники",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "organizers",
            "name": "Организация пространства (корзины, полки)",
            "type": "category",
            "filters": [
              {
                "id": "material",
                "type": "multi-select",
                "options": ["Дерево", "Металл", "Текстиль", "Стекло"]
              },
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Минимализм", "Рустик", "Бохо", "Модерн"]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              }
            ]
          }
        ]
      },
      {
        "id": "gifts",
        "name": "Подарки",
        "type": "collection",
        "categories": [
          {
            "id": "giftSets",
            "name": "Подарочные наборы",
            "type": "category",
            "filters": [
              {
                "id": "occasion",
                "type": "multi-select",
                "options": [
                  "День рождения",
                  "Свадьба",
                  "Новый год",
                  "8 марта",
                  "23 февраля"
                ]
              },
              {
                "id": "priceRange",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "greetingCards",
            "name": "Открытки и конверты",
            "type": "category",
            "filters": [
              {
                "id": "occasion",
                "type": "multi-select",
                "options": [
                  "День рождения",
                  "Свадьба",
                  "Новый год",
                  "8 марта",
                  "23 февраля"
                ]
              },
              {
                "id": "priceRange",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "souvenirs",
            "name": "Сувениры",
            "type": "category",
            "filters": [
              {
                "id": "occasion",
                "type": "multi-select",
                "options": [
                  "День рождения",
                  "Свадьба",
                  "Новый год",
                  "8 марта",
                  "23 февраля"
                ]
              },
              {
                "id": "priceRange",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "diyKits",
            "name": "Наборы для творчества",
            "type": "category",
            "filters": [
              {
                "id": "occasion",
                "type": "multi-select",
                "options": [
                  "День рождения",
                  "Свадьба",
                  "Новый год",
                  "8 марта",
                  "23 февраля"
                ]
              },
              {
                "id": "priceRange",
                "type": "range",
                "options": []
              }
            ]
          }
        ]
      },
      {
        "id": "exclusive",
        "name": "Эксклюзив",
        "type": "collection",
        "categories": [
          {
            "id": "limitedCollections",
            "name": "Лимитированные коллекции",
            "type": "category",
            "filters": [
              {
                "id": "collectionType",
                "type": "multi-select",
                "options": ["Лимитированная серия", "Коллаборация", "Винтаж"]
              },
              {
                "id": "personalized",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "year",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "artistCollaborations",
            "name": "Коллаборации с художниками",
            "type": "category",
            "filters": [
              {
                "id": "collectionType",
                "type": "multi-select",
                "options": ["Лимитированная серия", "Коллаборация", "Винтаж"]
              },
              {
                "id": "personalized",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "year",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "vintage",
            "name": "Винтажные товары",
            "type": "category",
            "filters": [
              {
                "id": "collectionType",
                "type": "multi-select",
                "options": ["Лимитированная серия", "Коллаборация", "Винтаж"]
              },
              {
                "id": "personalized",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "year",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "personalized",
            "name": "Персонализированные заказы",
            "type": "category",
            "filters": [
              {
                "id": "collectionType",
                "type": "multi-select",
                "options": ["Лимитированная серия", "Коллаборация", "Винтаж"]
              },
              {
                "id": "personalized",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "year",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "rareMaterials",
            "name": "Товары из редких материалов",
            "type": "category",
            "filters": [
              {
                "id": "collectionType",
                "type": "multi-select",
                "options": ["Лимитированная серия", "Коллаборация", "Винтаж"]
              },
              {
                "id": "personalized",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "year",
                "type": "range",
                "options": []
              }
            ]
          },
          {
            "id": "artworks",
            "name": "Арт-объекты и картины",
            "type": "category",
            "filters": [
              {
                "id": "collectionType",
                "type": "multi-select",
                "options": ["Лимитированная серия", "Коллаборация", "Винтаж"]
              },
              {
                "id": "personalized",
                "type": "boolean",
                "options": ["Да", "Нет"]
              },
              {
                "id": "year",
                "type": "range",
                "options": []
              }
            ]
          }
        ]
      },
      {
        "id": "art",
        "name": "Искусство",
        "type": "collection",
        "categories": [
          {
            "id": "paintings",
            "name": "Живопись",
            "type": "category",
            "filters": [
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Абстракция", "Реализм", "Импрессионизм", "Модерн"]
              },
              {
                "id": "medium",
                "type": "multi-select",
                "options": [
                  "Масло",
                  "Акрил",
                  "Акварель",
                  "Цифровая графика",
                  "Фотография"
                ]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              },
              {
                "id": "framed",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "graphicsAndPrints",
            "name": "Графика и принты",
            "type": "category",
            "filters": [
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Абстракция", "Реализм", "Импрессионизм", "Модерн"]
              },
              {
                "id": "medium",
                "type": "multi-select",
                "options": [
                  "Масло",
                  "Акрил",
                  "Акварель",
                  "Цифровая графика",
                  "Фотография"
                ]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              },
              {
                "id": "framed",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "sculptures",
            "name": "Скульптура",
            "type": "category",
            "filters": [
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Абстракция", "Реализм", "Импрессионизм", "Модерн"]
              },
              {
                "id": "medium",
                "type": "multi-select",
                "options": [
                  "Масло",
                  "Акрил",
                  "Акварель",
                  "Цифровая графика",
                  "Фотография"
                ]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              },
              {
                "id": "framed",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "digitalArt",
            "name": "Цифровое искусство",
            "type": "category",
            "filters": [
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Абстракция", "Реализм", "Импрессионизм", "Модерн"]
              },
              {
                "id": "medium",
                "type": "multi-select",
                "options": [
                  "Масло",
                  "Акрил",
                  "Акварель",
                  "Цифровая графика",
                  "Фотография"
                ]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              },
              {
                "id": "framed",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "photography",
            "name": "Фотография",
            "type": "category",
            "filters": [
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Абстракция", "Реализм", "Импрессионизм", "Модерн"]
              },
              {
                "id": "medium",
                "type": "multi-select",
                "options": [
                  "Масло",
                  "Акрил",
                  "Акварель",
                  "Цифровая графика",
                  "Фотография"
                ]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              },
              {
                "id": "framed",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          },
          {
            "id": "handmadeFigures",
            "name": "Авторские фигурки",
            "type": "category",
            "filters": [
              {
                "id": "style",
                "type": "multi-select",
                "options": ["Абстракция", "Реализм", "Импрессионизм", "Модерн"]
              },
              {
                "id": "medium",
                "type": "multi-select",
                "options": [
                  "Масло",
                  "Акрил",
                  "Акварель",
                  "Цифровая графика",
                  "Фотография"
                ]
              },
              {
                "id": "dimensions",
                "type": "range",
                "options": []
              },
              {
                "id": "framed",
                "type": "boolean",
                "options": ["Да", "Нет"]
              }
            ]
          }
        ]
      }
    ]
    }', true);
    }
}
