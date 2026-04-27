<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProfessionalProfile;
use App\Services\ProfessionalProfileService;
use Illuminate\Http\Request;

class ProfessionalProfileController extends Controller
{
    public function __construct(private readonly ProfessionalProfileService $professionalProfileService)
    {
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'profile_role' => 'nullable|in:all,bac_si,ke_toan',
            'status' => 'nullable|in:all,draft,pending,approved,expired,rejected,inactive',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        return response()->json($this->professionalProfileService->listProfiles($validated));
    }

    public function options()
    {
        return response()->json($this->professionalProfileService->getOptions());
    }

    public function store(Request $request)
    {
        $payload = $this->validatedPayload($request);
        $profile = $this->professionalProfileService->createProfile(
            $payload,
            $request->file('certificate_files', []),
            $request->user()
        );

        return response()->json([
            'message' => 'Tao ho so chuyen mon thanh cong.',
            'profile' => $profile,
        ], 201);
    }

    public function show(ProfessionalProfile $professionalProfile)
    {
        return response()->json($this->professionalProfileService->getProfile($professionalProfile->id));
    }

    public function update(Request $request, ProfessionalProfile $professionalProfile)
    {
        $payload = $this->validatedPayload($request);
        $profile = $this->professionalProfileService->updateProfile(
            $professionalProfile,
            $payload,
            $request->file('certificate_files', []),
            $request->user()
        );

        return response()->json([
            'message' => 'Cap nhat ho so chuyen mon thanh cong.',
            'profile' => $profile,
        ]);
    }

    public function submit(ProfessionalProfile $professionalProfile, Request $request)
    {
        $profile = $this->professionalProfileService->submitForApproval($professionalProfile, $request->user());

        return response()->json([
            'message' => 'Da chuyen ho so sang cho duyet.',
            'profile' => $profile,
        ]);
    }

    public function approve(ProfessionalProfile $professionalProfile, Request $request)
    {
        $profile = $this->professionalProfileService->approve($professionalProfile, $request->user());

        return response()->json([
            'message' => 'Duyet ho so thanh cong.',
            'profile' => $profile,
        ]);
    }

    public function reject(ProfessionalProfile $professionalProfile, Request $request)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $profile = $this->professionalProfileService->reject($professionalProfile, $validated['reason'], $request->user());

        return response()->json([
            'message' => 'Tu choi ho so thanh cong.',
            'profile' => $profile,
        ]);
    }

    public function invalidate(ProfessionalProfile $professionalProfile, Request $request)
    {
        $profile = $this->professionalProfileService->invalidate($professionalProfile, $request->user());

        return response()->json([
            'message' => 'Vo hieu hoa ho so thanh cong.',
            'profile' => $profile,
        ]);
    }

    public function history(ProfessionalProfile $professionalProfile)
    {
        return response()->json($this->professionalProfileService->getHistory($professionalProfile));
    }

    public function stats()
    {
        return response()->json($this->professionalProfileService->getStats());
    }

    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:professional_profiles,id',
        ]);

        $result = $this->professionalProfileService->bulkApprove($validated['ids'], $request->user());

        return response()->json([
            'message' => sprintf(
                'Da duyet %d/%d ho so.',
                count($result['approved']),
                count($validated['ids'])
            ),
            'result' => $result,
        ]);
    }

    public function bulkReject(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:professional_profiles,id',
            'reason' => 'required|string|min:10|max:1000',
        ]);

        $result = $this->professionalProfileService->bulkReject(
            $validated['ids'],
            $validated['reason'],
            $request->user()
        );

        return response()->json([
            'message' => sprintf(
                'Da tu choi %d/%d ho so.',
                count($result['rejected']),
                count($validated['ids'])
            ),
            'result' => $result,
        ]);
    }

    public function downloadCertificate(int $certificate, Request $request)
    {
        $user = $request->user();
        $isAdmin = $user?->hasRole('admin') ?? false;

        return $this->professionalProfileService->downloadCertificate(
            $certificate,
            $user,
            $isAdmin
        );
    }

    private function validatedPayload(Request $request): array
    {
        $validated = $request->validate([
            'staff_id' => 'required|integer|exists:staff,id',
            'profile_role' => 'required|in:bac_si,ke_toan',
            'status' => 'nullable|in:draft,pending',
            'notes' => 'nullable|string',
            'specialties_payload' => 'nullable|string',
            'certificates_payload' => 'nullable|string',
            'certificate_files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        return array_merge($validated, [
            'specialties' => $this->decodeJsonField($request->input('specialties_payload', '[]'), 'specialties_payload'),
            'certificates' => $this->decodeJsonField($request->input('certificates_payload', '[]'), 'certificates_payload'),
        ]);
    }

    private function decodeJsonField(?string $json, string $field): array
    {
        if ($json === null || trim($json) === '') {
            return [];
        }

        $decoded = json_decode($json, true);
        if (! is_array($decoded)) {
            abort(422, "Truong {$field} khong hop le.");
        }

        return $decoded;
    }
}
