<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouvelle demande de contact</title>
</head>
<body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h1 style="margin-bottom: 16px;">Nouvelle demande de contact recue</h1>

    <p>Une nouvelle demande vient d'etre enregistree sur la plateforme{{ $platformSetting?->platform_name ? ' ' . $platformSetting->platform_name : '' }}.</p>

    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tr>
            <td style="font-weight: bold; width: 220px;">Nom</td>
            <td>{{ $contactForm->name }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Contact client</td>
            <td>{{ $contactForm->email }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Sujet</td>
            <td>{{ $contactForm->subject ?: '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold; vertical-align: top;">Message</td>
            <td>{!! nl2br(e($contactForm->message ?: '-')) !!}</td>
        </tr>
    </table>
</body>
</html>
