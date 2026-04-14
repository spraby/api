<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public const MAX_DEPTH = 3;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'menu' => ['present', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $errors = [];
            $this->validateNodes($this->input('menu', []), 1, '', $errors);

            foreach ($errors as $path => $message) {
                $v->errors()->add($path, $message);
            }
        });
    }

    private function validateNodes(mixed $nodes, int $depth, string $path, array &$errors): void
    {
        if (!is_array($nodes)) {
            $errors[$path ?: 'menu'] = 'Должен быть массивом.';

            return;
        }

        if ($depth > self::MAX_DEPTH) {
            $errors[$path] = sprintf('Превышена максимальная глубина (%d).', self::MAX_DEPTH);

            return;
        }

        foreach ($nodes as $i => $node) {
            $nodePath = $path === '' ? "menu.{$i}" : "{$path}.{$i}";

            if (!is_array($node)) {
                $errors[$nodePath] = 'Узел должен быть объектом.';
                continue;
            }

            if (!isset($node['title']) || !is_string($node['title']) || trim($node['title']) === '') {
                $errors["{$nodePath}.title"] = 'Заголовок обязателен.';
            } elseif (mb_strlen($node['title']) > 255) {
                $errors["{$nodePath}.title"] = 'Заголовок слишком длинный.';
            }

            if (!isset($node['url']) || !is_string($node['url']) || trim($node['url']) === '') {
                $errors["{$nodePath}.url"] = 'URL обязателен.';
            } elseif (mb_strlen($node['url']) > 500) {
                $errors["{$nodePath}.url"] = 'URL слишком длинный.';
            }

            if (isset($node['ref_type']) && !in_array($node['ref_type'], ['collection', 'category', 'custom'], true)) {
                $errors["{$nodePath}.ref_type"] = 'Недопустимый тип ссылки.';
            }

            if (isset($node['children']) && $node['children'] !== null && $node['children'] !== []) {
                $this->validateNodes($node['children'], $depth + 1, "{$nodePath}.children", $errors);
            }
        }
    }
}