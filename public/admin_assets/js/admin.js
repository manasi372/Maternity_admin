document.getElementById("doctorForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let formData = new FormData(this);

    let response = await fetch("/admin/save_doctor", {
        method: "POST",
        body: formData,
    });

    let result = await response.json();
    if (result.success) {
        refreshDoctorList(); // Update the list without reload
        this.reset(); // Reset form after submission
    }
});

async function refreshDoctorList() {
    let response = await fetch("/admin/doctor_list");
    let data = await response.text();
    document.getElementById("doctorList").innerHTML = data;
}
