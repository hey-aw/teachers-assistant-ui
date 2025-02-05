const React = require('react');

const Thread = ({
  runtime,
  components,
  assistantMessage,
}) => (
  <div role="complementary" data-error={runtime.isError || undefined}>
    <div data-testid="messages">
      {runtime.messages?.map((msg) => (
        <div key={msg.id}>{typeof msg.content === 'string' ? msg.content : 'Complex content'}</div>
      ))}
    </div>
    <input
      role="textbox"
      type="text"
      onChange={() => {}}
      onKeyDown={() => {}}
    />
    {components?.MessagesFooter && <components.MessagesFooter />}
  </div>
);

module.exports = {
  Thread,
  TextContentPartComponent: jest.fn(),
  CompositeAttachmentAdapter: jest.fn(),
  SimpleImageAttachmentAdapter: jest.fn(),
  SimpleTextAttachmentAdapter: jest.fn(),
}; 