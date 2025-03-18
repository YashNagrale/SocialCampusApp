document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const imageInput = document.getElementById("event-image");
    const imagePreview = document.getElementById("image-preview");
    const uploadText = document.getElementById("upload-text");
    const eventDescp = document.getElementById("event-description");
    const eventTitle = document.getElementById("event-title");
    const previewDescp = document.getElementById("preview-description");
    const previewTitle = document.getElementById("preview-title");
  
    if (!dropZone || !imageInput || !imagePreview || !uploadText || !eventDescp || !eventTitle || !previewDescp || !previewTitle) {
        console.error("One or more elements not found:", { dropZone, imageInput, imagePreview, uploadText, eventDescp, eventTitle, previewDescp, previewTitle });
        return;
    }
  
    imagePreview.src = "../assets/dummy-img.jpg";
  
    dropZone.addEventListener("click", () => {
        imageInput.click();
    });
  
    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) previewImage(file);
        else imagePreview.src = "../assets/dummy-img.jpg";
    });
  
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("border-white");
    });
  
    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-white");
    });
  
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-white");
        const file = e.dataTransfer.files[0];
        if (file) {
            imageInput.files = e.dataTransfer.files; // Set the input file for form submission
            previewImage(file); // Preview the image
        } else {
            imagePreview.src = "../assets/dummy-img.jpg";
        }
    });
  
    function previewImage(file) {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
            };
            reader.onerror = () => {
                console.error("Error reading file");
                alert("Failed to preview image.");
                imagePreview.src = "../assets/dummy-img.jpg";
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
            imagePreview.src = "../assets/dummy-img.jpg";
        }
    }
  
    eventTitle.addEventListener("input", (event) => {
        previewTitle.textContent = event.target.value;
    });
  
    eventDescp.addEventListener("input", (event) => {
        previewDescp.textContent = event.target.value;
    });
  });
  