import { Webhook, MessageBuilder } from 'discord-webhook-node'
const hook = new Webhook("https://discord.com/api/webhooks/930254583484280842/EeUdHTihNXypXjdlkqIVJydnXVhKqJh9tJyKpp1L44ukVu0tWroDGJJ43TfUU1pXmp2-");

export default function (title, description, color) {
    let setColor = color ? '#00b0f4' : '#FF5733'
    const embed = new MessageBuilder()
        .setTitle(title)
        .setAuthor('Notebooksbilliger Bot')
        .setColor(setColor)
        .setDescription(description)
        .setTimestamp()
    return {send: function () {
        hook.send(embed);
    }}
}