<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_user_management()
    {
        $response = $this->get(route('users.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_buyer_users_are_not_automatically_promoted_to_master_on_request_and_cannot_access_dashboard()
    {
        $user = User::factory()->create(['role' => 'buyer']);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertStatus(403);

        $this->assertEquals('buyer', $user->fresh()->role);
    }

    public function test_seller_users_are_not_automatically_promoted_to_master_on_request()
    {
        $user = User::factory()->create(['role' => 'seller', 'permissions' => ['dashboard']]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();

        $this->assertEquals('seller', $user->fresh()->role);
    }

    public function test_master_users_can_access_user_management()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        $response = $this->get(route('users.index'));
        $response->assertOk();
    }

    public function test_master_user_can_create_a_new_user()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        $response = $this->post(route('users.store'), [
            'name' => 'New User Name',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'seller',
            'status' => 'active',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => 'seller',
            'status' => 'active',
        ]);
    }

    public function test_master_user_can_update_an_existing_user()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        $targetUser = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'oldemail@example.com',
            'role' => 'buyer',
            'status' => 'active',
        ]);

        $response = $this->put(route('users.update', $targetUser), [
            'name' => 'Updated Name',
            'email' => 'newemail@example.com',
            'role' => 'seller',
            'status' => 'inactive',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'Updated Name',
            'email' => 'newemail@example.com',
            'role' => 'seller',
            'status' => 'inactive',
        ]);
    }

    public function test_deactivated_users_are_logged_out_automatically()
    {
        $user = User::factory()->create([
            'role' => 'master',
            'status' => 'active',
        ]);
        
        $this->actingAs($user);

        // Access dashboard successfully
        $this->get(route('dashboard'))->assertOk();

        // Deactivate user in database
        $user->update(['status' => 'inactive']);

        // Next request redirects to login and logs out
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }
}
