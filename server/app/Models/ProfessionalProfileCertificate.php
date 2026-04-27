<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class ProfessionalProfileCertificate extends Model
{
    public const DOWNLOAD_PATH_PREFIX = '/professional-profiles/certificates';

    protected $fillable = [
        'professional_profile_id',
        'professional_profile_specialty_id',
        'certificate_type',
        'certificate_name',
        'certificate_number',
        'issued_date',
        'expiry_date',
        'issuer',
        'scope_label',
        'notes',
        'file_path',
        'file_name',
        'file_mime',
        'file_size',
        'is_primary',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'expiry_date' => 'date',
        'is_primary' => 'boolean',
    ];

    protected $appends = [
        'is_expired',
        'is_expiring_soon',
        'file_url',
    ];

    public function profile()
    {
        return $this->belongsTo(ProfessionalProfile::class, 'professional_profile_id');
    }

    public function specialty()
    {
        return $this->belongsTo(ProfessionalProfileSpecialty::class, 'professional_profile_specialty_id');
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date ? $this->expiry_date->isPast() : false;
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        if (! $this->expiry_date) {
            return false;
        }

        $today = Carbon::today();

        return $this->expiry_date->greaterThanOrEqualTo($today)
            && $this->expiry_date->lessThanOrEqualTo($today->copy()->addDays(30));
    }

    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path || ! $this->id) {
            return null;
        }

        return self::DOWNLOAD_PATH_PREFIX.'/'.$this->id.'/download';
    }
}
