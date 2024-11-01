let counter = 0;
let qrCodeDataUrl = ''; // Variable to store QR code image as a data URL

function hasCustomerTakenReceipt(customerID) {
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    return customers.find(customer => customer.customerID === customerID);
}

function markCustomerReceipt(customerID, name, token) {
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers.push({ customerID, name, token });
    localStorage.setItem('customers', JSON.stringify(customers));
}

function validateForm() {
    const name = document.getElementById('customerName').value;
    const customerID = document.getElementById('customerID').value;
    const nameError = document.getElementById('nameError');
    const idError = document.getElementById('idError');
    const alertMessage = document.getElementById('alertMessage');

    nameError.style.display = 'none';
    idError.style.display = 'none';
    alertMessage.style.display = 'none';

    let isValid = true;

    if (name.trim() === "") {
        nameError.style.display = 'block';
        isValid = false;
    }

    if (customerID.trim() === "") {
        idError.style.display = 'block';
        isValid = false;
    }

    if (isValid && hasCustomerTakenReceipt(customerID)) {
        alertMessage.style.display = 'block';
        return;
    }

    if (isValid) {
        counter++;
        markCustomerReceipt(customerID, name, counter);
        incrementAndGenerateQRCode(counter);
    }
}

function incrementAndGenerateQRCode(token) {
    document.getElementById('number').textContent = token;

    const name = document.getElementById('customerName').value;
    const customerID = document.getElementById('customerID').value;
    const qrData = `Name: ${name}, Customer ID: ${customerID}, Token No: ${token}`;

    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';

    const qrCode = new QRCode(qrcodeContainer, {
        text: qrData,
        width: 128,
        height: 128
    });

    setTimeout(() => {
        const qrCanvas = qrcodeContainer.getElementsByTagName('canvas')[0];
        qrCodeDataUrl = qrCanvas.toDataURL();

        const receipt = `
            <h2>Receipt</h2>
            <p><strong>Token No:</strong> ${token}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Customer ID:</strong> ${customerID}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 128px; height: 128px;">
        `;
        document.getElementById('receipt').innerHTML = receipt;
        document.getElementById('receipt').style.display = 'block';
        document.getElementById('printButton').style.display = 'block';
        document.getElementById('generatePDFButton').style.display = 'block';
    }, 100);

    document.getElementById('customer-form').reset();
}

function printReceipt() {
    const receiptContents = document.getElementById('receipt').innerHTML;
    const printWindow = window.open('', '', 'width=400,height=400');
    printWindow.document.write(receiptContents);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
}

function showCustomerList() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customerList = document.getElementById('customerList');

    if (customers.length === 0) {
        customerList.innerHTML = '<p>No customers have received a receipt yet.</p>';
    } else {
        customerList.innerHTML = '<h3>Customers who have received receipts:</h3>';
        customers.forEach(customer => {
            customerList.innerHTML += `<div class="customer-entry">
                <strong>Name:</strong> ${customer.name} <br>
                <strong>Customer ID:</strong> ${customer.customerID} <br>
                <strong>Token No:</strong> ${customer.token}
            </div>`;
        });
    }
    customerList.style.display = 'block';
}

function deleteCustomerRecord() {
    const customerID = prompt("Enter the Customer ID of the record you wish to delete:");
    if (!customerID) return;

    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers = customers.filter(customer => customer.customerID !== customerID);
    localStorage.setItem('customers', JSON.stringify(customers));
    alert("Record deleted successfully.");
}

function resetAllData() {
    const confirmation = confirm("Are you sure you want to reset all data? This action cannot be undone.");
    if (confirmation) {
        localStorage.removeItem('customers');
        document.getElementById('customerList').style.display = 'none'; // Hide customer list
        document.getElementById('receipt').innerHTML = ''; // Clear the receipt display
        document.getElementById('number').textContent = '0'; // Reset token number
        alert("All data has been reset.");
    }
}

function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const receipt = document.getElementById('receipt').textContent;
    doc.text(receipt, 10, 10);

    if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', 10, 50, 50, 50);
    }

    doc.save('receipt.pdf');
}
