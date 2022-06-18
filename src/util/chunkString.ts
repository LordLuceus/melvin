export function chunkString(text: string, delimiter = " ", maxLength = 2000) {
  const splitText = text.split(delimiter);
  const messages = [];
  let msg = "";
  splitText.forEach((s) => {
    if (msg.length + s.length > maxLength) {
      messages.push(msg);
      msg = s;
    } else {
      msg = msg + delimiter + s;
    }
  });
  messages.push(msg);
  return messages;
}
