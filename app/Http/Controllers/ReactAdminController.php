<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReactAdminController extends Controller
{
    public function index()
    {
        return view('admin');
    }
}
