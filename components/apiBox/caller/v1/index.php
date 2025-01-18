<?
$ch = curl_init('https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer EEJP0wHu083SEl08nVhkAkqWPLr7',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, {
    "ShortCode": 600998,
    "ResponseType": "Completed",
    "ConfirmationURL": "https://mydomain.com/confirmation",
    "ValidationURL": "https://mydomain.com/validation",
  });
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response     = curl_exec($ch);
curl_close($ch);
echo $response;