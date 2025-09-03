<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize form data
    $salutation = htmlspecialchars($_POST['salutation']);
    $first_name = htmlspecialchars($_POST['first_name']);
    $last_name = htmlspecialchars($_POST['last_name']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $model_interested_in = htmlspecialchars($_POST['model']);
    $get_brochure = isset($_POST['get_voucher']) ? 'Yes' : 'No';

    // TEST recipient
    $to = "sayedshoaib3869224@gmail.com@gmail.com";

    // Subject
    $subject = "Test Enquiry from Modi Kia Website";

    // Email body
    $body = "New Enquiry Details:\n\n";
    $body .= "Salutation: $salutation\n";
    $body .= "First Name: $first_name\n";
    $body .= "Last Name: $last_name\n";
    $body .= "Email: $email\n";
    $body .= "Mobile: $phone\n";
    $body .= "Model Interested In: $model_interested_in\n";
    $body .= "Request for Brochure: $get_brochure\n";

    // Headers
    $headers = "From: no-reply@modikia.com\r\n"; // must use your domain
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send
    if (mail($to, $subject, $body, $headers)) {
        echo "✅ Test mail sent to $to";
    } else {
        echo "❌ Mail not sent. Check if Hostinger blocks mail().";
    }
} else {
    echo "Form not submitted.";
}
?>
