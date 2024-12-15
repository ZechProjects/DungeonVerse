function showToast(message, type = 'info') {
  const backgroundColor = {
    info: 'linear-gradient(to right, #00b09b, #96c93d)',
    error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
    warning: 'linear-gradient(to right, #f7b733, #fc4a1a)',
    success: 'linear-gradient(to right, #00b09b, #96c93d)'
  };

  Toastify({
    text: message,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    style: {
      background: backgroundColor[type]
    }
  }).showToast();
}
