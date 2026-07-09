<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * migrate:fresh в тестах должен дропать и Postgres enum-типы
     * (order_status и т.п.), иначе повторный прогон падает на CREATE TYPE.
     */
    protected bool $dropTypes = true;
}
