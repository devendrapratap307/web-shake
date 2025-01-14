import { OwnDatePipe } from './own-date.pipe';

describe('OwnDatePipe', () => {
  it('create an instance', () => {
    const pipe = new OwnDatePipe();
    expect(pipe).toBeTruthy();
  });
});
