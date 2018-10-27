const Color = require('../color');

test('Reaction status color', () => {
  expect(Color.STATUS).toHaveLength(5);
  expect(Color.getLabel('closed')).toBe('Closed');
  expect(Color.getColor('closed')).toBe('rgba(206,224,227,1)');
  let form = Color.getForm('closed');
  expect(form.length).toBeGreaterThan(100);
  expect(form).toMatch('<option value="closed" selected>');
});
