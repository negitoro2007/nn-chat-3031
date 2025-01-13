'use strict'; // 一番下を表示

window.addEventListener('load', function () {
  window.scrollTo(0, document.body.scrollHeight);
}); // エンターキー と Ctrlキー(Macの場合はCommandキー)を押していたら送信

var formElement = document.forms['message-form'];
var textareaElement = formElement.elements['content'];
textareaElement.addEventListener('keydown', function (event) {
  // 送信キーを押したら
  if (isPressedSubmitKey(event)) {
    // キーボード入力をキャンセルして送信
    event.preventDefault();
    formElement.submit();
  }
}); // 送信キーを押しているか判定

function isPressedSubmitKey(event) {
  if (event.key !== 'Enter') {
    return false;
  }

  if (event.ctrlKey) {
    return true;
  } // MacのCommandキーはmetaKeyという名前


  if (event.metaKey) {
    return true;
  }
} // ツールチップの有効化


var tooltipTriggerElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerElements.forEach(function (tooltipTriggerElement) {
  new bootstrap.Tooltip(tooltipTriggerElement);
});