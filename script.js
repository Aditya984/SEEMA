const currentTime = document.getElementById("currentTime");
const currentYear = document.getElementById("currentYear");
const inquiryForm = document.getElementById("inquiryForm");
const formStatus = document.getElementById("formStatus");

function showTime() {
    if (currentTime) {
        currentTime.textContent = new Date().toUTCString();
    }
}

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

showTime();
setInterval(showTime, 1000);

if (inquiryForm && formStatus) {
    inquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();

        formStatus.textContent =
            "Thank you! Your inquiry has been received. We will contact you soon.";

        inquiryForm.reset();
    });
}
