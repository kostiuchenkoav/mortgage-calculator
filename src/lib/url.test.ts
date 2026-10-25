import { describe, expect, it } from 'vitest';
import { DEFAULT_VALUES } from './validation';
import { fromSearch, toSearch } from './url';

describe('адресная строка', () => {
  it('значения по умолчанию дают пустой запрос', () => {
    expect(toSearch(DEFAULT_VALUES)).toBe('');
  });

  it('изменённые значения сохраняются и читаются обратно', () => {
    const changed = { ...DEFAULT_VALUES, price: '8000000', type: 'differentiated' as const, earlyMode: 'payment' as const };
    const search = toSearch(changed);
    expect(search).toContain('p=8000000');
    expect(fromSearch(search)).toEqual(changed);
  });

  it('неизвестные значения заменяются значениями по умолчанию', () => {
    const values = fromSearch('?type=foo&emode=bar');
    expect(values.type).toBe(DEFAULT_VALUES.type);
    expect(values.earlyMode).toBe(DEFAULT_VALUES.earlyMode);
  });
});
