// Private keys must never be exposed in browser code.
var EMAILJS_PUBLIC_KEY  = "CQuvOperTsAZZrgdG";
var EMAILJS_SERVICE_ID  = "service_1wfnduv";
var EMAILJS_TEMPLATE_ID = "template_8g1kyr8";

function getEmailJsConfigError() {
  if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
    return "EmailJS public key is missing.";
  }

  if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID.indexOf("service_") !== 0) {
    return "EmailJS service ID is invalid. It must start with service_.";
  }

  if (!EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID") {
    return "EmailJS template ID is missing.";
  }

  if (EMAILJS_TEMPLATE_ID.indexOf("template_") !== 0) {
    return "EmailJS template ID is invalid. It must start with template_.";
  }

  return "";
}

emailjs.init(EMAILJS_PUBLIC_KEY);

function sendEmail() {
  var configError = getEmailJsConfigError();
  if (configError) {
    alert(configError);
    return;
  }

  var from_name = document.getElementById("fullName").value;
  var email     = document.getElementById("email").value;
  var phone     = document.getElementById("phone").value;
  var message   = document.getElementById("message").value;

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name:     from_name,
    visitor_email: email,
    phone:         phone,
    message:       message,
    reply_to:      email
  })
  .then(function() {
    alert("Message sent successfully!");
    document.getElementById("contactForm").reset();
  }, function(error) {
    var errorText = error.text || JSON.stringify(error);
    if (errorText === "Account not found") {
      alert("EmailJS account mismatch. Verify the Public Key, Service ID, and Template ID come from the same EmailJS account, and that the Template ID starts with template_.");
      return;
    }
    alert("Failed to send: " + errorText);
    console.error("EmailJS error:", error);
  });
}
