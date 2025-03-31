CONTAINER=spraby-api
DB_CONTAINER=spraby-api-postgres

up:
	docker compose up

build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose down && docker compose up -d --build

bash:
	docker exec -it $(CONTAINER) bash

migrate:
	docker exec -it $(CONTAINER) php artisan migrate

seed:
	docker exec -it $(CONTAINER) php artisan db:seed

fix-perms:
	docker exec -it $(CONTAINER) bash -c "chown -R www-data:www-data storage bootstrap/cache && chmod -R 775 storage bootstrap/cache"

logs:
	docker compose logs -f

psql:
	docker exec -it $(DB_CONTAINER) psql -U laravel -d laravel

composer:
	docker exec -it $(CONTAINER) composer install
