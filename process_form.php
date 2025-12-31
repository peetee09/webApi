<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Generate a unique reference number
    $referenceNumber = 'REF-' . strtoupper(uniqid());
    
    // Collect and sanitize form data
    $fullName = htmlspecialchars($_POST['full_name']);
    $jobTitle = htmlspecialchars($_POST['job_title'] ?? '');
    $organization = htmlspecialchars($_POST['organization']);
    $industry = htmlspecialchars($_POST['industry']);
    $organizationSize = htmlspecialchars($_POST['organization_size']);
    $organizationType = htmlspecialchars($_POST['organization_type']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $province = htmlspecialchars($_POST['province']);
    $city = htmlspecialchars($_POST['city']);
    $address = htmlspecialchars($_POST['address'] ?? '');
    
    // Services (array)
    $services = isset($_POST['services']) ? $_POST['services'] : [];
    $servicesList = implode(', ', array_map('htmlspecialchars', $services));
    
    $otherServiceDetails = htmlspecialchars($_POST['other_service_details'] ?? '');
    $projectDetails = htmlspecialchars($_POST['project_details']);
    $budgetRange = htmlspecialchars($_POST['budget_range'] ?? '');
    $timeline = htmlspecialchars($_POST['timeline'] ?? '');
    $currentChallenges = htmlspecialchars($_POST['current_challenges'] ?? '');
    $expectedOutcomes = htmlspecialchars($_POST['expected_outcomes'] ?? '');
    $referralSource = htmlspecialchars($_POST['referral_source'] ?? '');
    $existingSystems = htmlspecialchars($_POST['existing_systems'] ?? '');
    $marketingConsent = isset($_POST['marketing_consent']) ? 'Yes' : 'No';
    
    // Email configuration (replace with your email)
    $to = "info@sabitech.co.za;
    $subject = "New Service Enquiry: $referenceNumber";
    
    // Email body
    $emailBody = "
    <html>
    <head>
        <title>New Service Enquiry</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .field { margin-bottom: 10px; }
            .field-label { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>New Service Enquiry Received</h2>
            <p>Reference Number: <strong>$referenceNumber</strong></p>
        </div>
        <div class='content'>
            <h3>Basic Information</h3>
            <div class='field'><span class='field-label'>Full Name:</span> $fullName</div>
            <div class='field'><span class='field-label'>Job Title:</span> $jobTitle</div>
            <div class='field'><span class='field-label'>Organization:</span> $organization</div>
            <div class='field'><span class='field-label'>Industry:</span> $industry</div>
            <div class='field'><span class='field-label'>Organization Size:</span> $organizationSize</div>
            <div class='field'><span class='field-label'>Organization Type:</span> $organizationType</div>
            
            <h3>Contact Information</h3>
            <div class='field'><span class='field-label'>Email:</span> $email</div>
            <div class='field'><span class='field-label'>Phone:</span> $phone</div>
            <div class='field'><span class='field-label'>Province:</span> $province</div>
            <div class='field'><span class='field-label'>City:</span> $city</div>
            <div class='field'><span class='field-label'>Address:</span> $address</div>
            
            <h3>Service Requirements</h3>
            <div class='field'><span class='field-label'>Services Interested In:</span> $servicesList</div>
            <div class='field'><span class='field-label'>Other Service Details:</span> $otherServiceDetails</div>
            <div class='field'><span class='field-label'>Project Details:</span> $projectDetails</div>
            <div class='field'><span class='field-label'>Budget Range:</span> $budgetRange</div>
            <div class='field'><span class='field-label'>Timeline:</span> $timeline</div>
            
            <h3>Additional Information</h3>
            <div class='field'><span class='field-label'>Current Challenges:</span> $currentChallenges</div>
            <div class='field'><span class='field-label'>Expected Outcomes:</span> $expectedOutcomes</div>
            <div class='field'><span class='field-label'>Referral Source:</span> $referralSource</div>
            <div class='field'><span class='field-label'>Existing Systems:</span> $existingSystems</div>
            <div class='field'><span class='field-label'>Marketing Consent:</span> $marketingConsent</div>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: enquiry-form@sabitech.co.za" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";
    
    // Send email
    $mailSent = mail($to, $subject, $emailBody, $headers);
    
    // Redirect back to form with success message
    if ($mailSent) {
        header("Location: Enquiry form.html?ref=" . $referenceNumber . "&success=1");
    } else {
        header("Location: Enquiry form.html?error=1");
    }
    exit();
} else {
    // If someone tries to access this page directly
    header("Location: Enquiry form.html");
    exit();
}
?>