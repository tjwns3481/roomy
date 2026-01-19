import { describe, expect, test } from 'vitest';
import { generateSlug, isValidSlug, normalizeSlug } from '@/lib/slug';

describe('Slug Library', () => {
  describe('isValidSlug', () => {
    test('유효한 슬러그를 통과시킨다', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('my-page')).toBe(true);
      expect(isValidSlug('page-123')).toBe(true);
      expect(isValidSlug('test')).toBe(true);
      expect(isValidSlug('a1b2c3')).toBe(true);
    });

    test('너무 짧은 슬러그를 거부한다 (3자 미만)', () => {
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('ab')).toBe(false);
      expect(isValidSlug('a')).toBe(false);
    });

    test('너무 긴 슬러그를 거부한다 (50자 초과)', () => {
      const longSlug = 'a'.repeat(51);
      expect(isValidSlug(longSlug)).toBe(false);
    });

    test('유효하지 않은 문자를 포함한 슬러그를 거부한다', () => {
      expect(isValidSlug('hello world')).toBe(false); // 공백
      expect(isValidSlug('hello_world')).toBe(false); // 언더스코어
      expect(isValidSlug('hello.world')).toBe(false); // 마침표
      expect(isValidSlug('hello/world')).toBe(false); // 슬래시
      expect(isValidSlug('HELLO')).toBe(false); // 대문자
      expect(isValidSlug('안녕하세요')).toBe(false); // 한글
    });

    test('하이픈으로 시작하거나 끝나는 슬러그를 거부한다', () => {
      expect(isValidSlug('-hello')).toBe(false);
      expect(isValidSlug('hello-')).toBe(false);
      expect(isValidSlug('-hello-')).toBe(false);
    });

    test('연속된 하이픈을 거부한다', () => {
      expect(isValidSlug('hello--world')).toBe(false);
      expect(isValidSlug('my---page')).toBe(false);
    });
  });

  describe('generateSlug', () => {
    test('영문 제목에서 슬러그를 생성한다', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('My First Page')).toBe('my-first-page');
      expect(generateSlug('Test 123')).toBe('test-123');
    });

    test('특수문자를 제거한다', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world');
      expect(generateSlug('Test@Page#123')).toBe('testpage123');
      expect(generateSlug('My (Cool) Page')).toBe('my-cool-page');
    });

    test('연속된 공백을 하나의 하이픈으로 변환한다', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
      expect(generateSlug('Multiple    Spaces')).toBe('multiple-spaces');
    });

    test('한글 제목을 로마자로 변환한다', () => {
      const slug = generateSlug('안녕하세요');
      expect(isValidSlug(slug)).toBe(true);
      expect(slug.length).toBeGreaterThanOrEqual(3);
    });

    test('한글과 영문이 섞인 제목을 처리한다', () => {
      const slug = generateSlug('나의 First Page');
      expect(isValidSlug(slug)).toBe(true);
      expect(slug.length).toBeGreaterThanOrEqual(3);
    });

    test('빈 제목이나 공백만 있는 경우 랜덤 문자열을 생성한다', () => {
      const slug1 = generateSlug('');
      const slug2 = generateSlug('   ');

      expect(isValidSlug(slug1)).toBe(true);
      expect(isValidSlug(slug2)).toBe(true);
      expect(slug1.length).toBeGreaterThanOrEqual(3);
      expect(slug2.length).toBeGreaterThanOrEqual(3);
    });

    test('너무 긴 제목을 50자로 자른다', () => {
      const longTitle = 'a'.repeat(100);
      const slug = generateSlug(longTitle);

      expect(slug.length).toBeLessThanOrEqual(50);
      expect(isValidSlug(slug)).toBe(true);
    });

    test('생성된 슬러그는 항상 유효하다', () => {
      const titles = [
        'Hello World',
        '안녕하세요',
        'Test!!!',
        '   ',
        'My Cool Page 123',
        '한글과 English 섞인 제목',
        '@#$%^&*()',
        '',
      ];

      titles.forEach((title) => {
        const slug = generateSlug(title);
        expect(isValidSlug(slug)).toBe(true);
      });
    });

    test('동일한 제목은 동일한 슬러그를 생성한다', () => {
      const title = 'Hello World';
      const slug1 = generateSlug(title);
      const slug2 = generateSlug(title);

      expect(slug1).toBe(slug2);
    });
  });

  describe('normalizeSlug', () => {
    test('슬러그를 정규화한다', () => {
      expect(normalizeSlug('Hello-World')).toBe('hello-world');
      expect(normalizeSlug('UPPERCASE')).toBe('uppercase');
    });

    test('유효하지 않은 문자를 제거한다', () => {
      expect(normalizeSlug('hello_world')).toBe('helloworld');
      expect(normalizeSlug('hello.world')).toBe('helloworld');
      expect(normalizeSlug('hello/world')).toBe('helloworld');
    });

    test('연속된 하이픈을 하나로 합친다', () => {
      expect(normalizeSlug('hello---world')).toBe('hello-world');
      expect(normalizeSlug('my--page')).toBe('my-page');
    });

    test('앞뒤 하이픈을 제거한다', () => {
      expect(normalizeSlug('-hello-')).toBe('hello');
      expect(normalizeSlug('---world---')).toBe('world');
    });

    test('한글을 제거한다', () => {
      expect(normalizeSlug('안녕하세요')).toBe('');
      expect(normalizeSlug('hello안녕world')).toBe('helloworld');
    });
  });
});
