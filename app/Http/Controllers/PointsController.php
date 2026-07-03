<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class PointsController extends Controller
{
    public function claim(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();

        if ($user->last_points_claimed_at) {
            $lastClaim = Carbon::parse($user->last_points_claimed_at);
            
            if ($lastClaim->isToday()) {
                return back()->withErrors(['points' => 'You have already claimed your daily Point Hany today.']);
            }

            // Check if last claim was yesterday (consecutive check-in)
            if ($lastClaim->isYesterday()) {
                $user->consecutive_claim_days += 1;
            } else {
                $user->consecutive_claim_days = 1;
            }
        } else {
            $user->consecutive_claim_days = 1;
        }

        $pointsToAward = $user->consecutive_claim_days * 2;
        $user->hany_points += $pointsToAward;
        $user->last_points_claimed_at = $now;
        $user->save();

        return back()->with('success', "Success! You claimed {$pointsToAward} Point Hany. Come back tomorrow for more!");
    }
}
