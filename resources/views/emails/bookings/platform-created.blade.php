<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouvelle reservation</title>
</head>
<body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h1 style="margin-bottom: 16px;">Nouvelle reservation recue</h1>

    <p>Une nouvelle reservation vient d'etre enregistree sur la plateforme{{ $platformSetting?->platform_name ? ' ' . $platformSetting->platform_name : '' }}.</p>

    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tr>
            <td style="font-weight: bold; width: 220px;">Client</td>
            <td>{{ $booking->name }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Email</td>
            <td>{{ $booking->email }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Telephone</td>
            <td>{{ $booking->phone ?: '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Circuit</td>
            <td>{{ $booking->tour?->title ?: '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Date de depart</td>
            <td>{{ optional($booking->start_date)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Date de retour</td>
            <td>{{ optional($booking->end_date)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Nombre de personnes</td>
            <td>{{ $booking->number_of_people }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Montant estime</td>
            <td>{{ number_format((float) $booking->total_amount, 2, ',', ' ') }} USD</td>
        </tr>
        <tr>
            <td style="font-weight: bold; vertical-align: top;">Message</td>
            <td>{{ $booking->message ?: '-' }}</td>
        </tr>
    </table>
</body>
</html>
