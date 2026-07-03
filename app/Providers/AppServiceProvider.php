<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Custom Login Response
        $this->app->singleton(
            \Laravel\Fortify\Contracts\LoginResponse::class,
            function () {
                return new class implements \Laravel\Fortify\Contracts\LoginResponse {
                    public function toResponse($request)
                    {
                        $role = $request->user()->role ?? 'buyer';
                        $redirect = ($role === 'seller' || $role === 'master') ? '/dashboard' : '/';
                        if ($redirect === '/') {
                            session()->forget('url.intended');
                        }
                        return $request->wantsJson()
                            ? response()->json(['two_factor' => false])
                            : redirect()->intended($redirect);
                    }
                };
            }
        );

        // Custom Register Response
        $this->app->singleton(
            \Laravel\Fortify\Contracts\RegisterResponse::class,
            function () {
                return new class implements \Laravel\Fortify\Contracts\RegisterResponse {
                    public function toResponse($request)
                    {
                        $role = $request->user()->role ?? 'buyer';
                        $redirect = ($role === 'seller' || $role === 'master') ? '/dashboard' : '/';
                        if ($redirect === '/') {
                            session()->forget('url.intended');
                        }
                        return $request->wantsJson()
                            ? response()->json(['two_factor' => false])
                            : redirect()->intended($redirect);
                    }
                };
            }
        );

        // Custom Logout Response
        $this->app->singleton(
            \Laravel\Fortify\Contracts\LogoutResponse::class,
            function () {
                return new class implements \Laravel\Fortify\Contracts\LogoutResponse {
                    public function toResponse($request)
                    {
                        return $request->wantsJson()
                            ? response()->json(['message' => 'Logged out'])
                            : redirect('/login');
                    }
                };
            }
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
