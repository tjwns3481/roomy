/**
 * 슬러그 생성 및 검증 유틸리티
 */

/**
 * 한글을 영문으로 변환하는 맵
 */
const HANGUL_TO_ENGLISH: Record<string, string> = {
  'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
  'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
  'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
  'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
  'ㅣ': 'i'
};

const INITIAL_CONSONANTS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const MEDIAL_VOWELS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const FINAL_CONSONANTS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/**
 * 한글 문자를 자음/모음으로 분해
 */
function decomposeHangul(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;

  if (code < 0 || code > 11171) {
    // 한글이 아닌 경우 그대로 반환
    return char;
  }

  const initialIndex = Math.floor(code / 588);
  const medialIndex = Math.floor((code % 588) / 28);
  const finalIndex = code % 28;

  const initial = INITIAL_CONSONANTS[initialIndex];
  const medial = MEDIAL_VOWELS[medialIndex];
  const final = FINAL_CONSONANTS[finalIndex];

  return initial + medial + final;
}

/**
 * 한글을 영문으로 변환 (로마자 표기)
 */
function hangulToRoman(text: string): string {
  return text
    .split('')
    .map(char => {
      const decomposed = decomposeHangul(char);
      return decomposed
        .split('')
        .map(c => HANGUL_TO_ENGLISH[c] || c)
        .join('');
    })
    .join('');
}

/**
 * 랜덤 문자열 생성
 */
function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 슬러그 유효성 검증
 * - 영문, 숫자, 하이픈만 허용
 * - 3~50자 길이
 * - 하이픈으로 시작하거나 끝나면 안됨
 * - 연속된 하이픈 불가
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) {
    return false;
  }

  // 영문, 숫자, 하이픈만 허용
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }

  // 하이픈으로 시작하거나 끝나면 안됨
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return false;
  }

  // 연속된 하이픈 불가
  if (slug.includes('--')) {
    return false;
  }

  return true;
}

/**
 * 제목에서 슬러그 생성
 * 1. 한글이 포함되어 있으면 로마자 변환 시도
 * 2. 변환 결과가 유효하지 않으면 랜덤 문자열 생성
 * 3. 소문자 변환, 특수문자 제거, 공백을 하이픈으로 변환
 */
export function generateSlug(title: string): string {
  if (!title || title.trim().length === 0) {
    return generateRandomString();
  }

  // 한글 포함 여부 확인
  const hasHangul = /[가-힣]/.test(title);

  let slug: string;

  if (hasHangul) {
    // 한글을 로마자로 변환
    const romanized = hangulToRoman(title);

    // 변환 후 처리
    slug = romanized
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
      .trim()
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-'); // 연속 하이픈 제거

    // 하이픈으로 시작/끝나는 경우 제거
    slug = slug.replace(/^-+|-+$/g, '');
  } else {
    // 영문/숫자인 경우 그대로 처리
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // 결과가 너무 짧거나 유효하지 않으면 랜덤 문자열 생성
  if (slug.length < 3 || !isValidSlug(slug)) {
    return generateRandomString();
  }

  // 너무 길면 자르기
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-+$/, '');
  }

  return slug;
}

/**
 * 슬러그 정규화
 * - 소문자 변환
 * - 유효하지 않은 문자 제거
 */
export function normalizeSlug(slug: string): string {
  const normalized = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
}
