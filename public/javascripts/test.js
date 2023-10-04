document.getElementById('emailForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var formData = new FormData(this);
  var recipient = formData.get('toAddress');
  var subject = formData.get('subject');
  var text = formData.get('message');

  var req = new XMLHttpRequest();
  req.open('POST', '/email/send');
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(JSON.stringify({ recipient: recipient, subject: subject, text: text }));

  req.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      alert('Email sent successfully!');
    } else if (this.readyState === 4 && this.status === 500) {
      alert('Failed to send email. Please try again.');
    }
  };
});
