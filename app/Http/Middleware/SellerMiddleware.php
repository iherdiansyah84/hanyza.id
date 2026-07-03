<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(403);
        }

        if ($user->role === 'master') {
            return $next($request);
        }

        if ($user->role === 'seller') {
            // Determine permission key based on path
            $path = $request->path();
            $permission = null;
            if (str_starts_with($path, 'categories')) {
                $permission = 'categories';
            } elseif (str_starts_with($path, 'products')) {
                $permission = 'products';
            } elseif (str_starts_with($path, 'vouchers')) {
                $permission = 'vouchers';
            } elseif (str_starts_with($path, 'orders')) {
                $permission = 'orders';
            } elseif (str_starts_with($path, 'dashboard')) {
                $permission = 'dashboard';
            }

            if ($permission && !$user->hasPermission($permission)) {
                abort(403, "Access denied. You do not have permission to access this page.");
            }

            return $next($request);
        }

        abort(403, 'Access denied. Only sellers or master admins can access this page.');
    }
}
