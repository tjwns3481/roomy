// @TASK T0.4 - UI 컴포넌트 데모 (개발용)
// 이 파일은 테스트 목적으로만 사용됩니다

import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './index';

export function UIDemo() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <section>
        <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Input Fields</h2>
        <div className="space-y-4 max-w-md">
          <Input label="이메일" type="email" placeholder="email@example.com" />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            helperText="8자 이상 입력해주세요"
          />
          <Input
            label="이름"
            type="text"
            defaultValue="잘못된 값"
            error="필수 입력 항목입니다"
          />
          <Input placeholder="라벨 없는 입력" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 카드</CardTitle>
              <CardDescription>설명이 들어갑니다</CardDescription>
            </CardHeader>
            <CardContent>
              <p>카드 본문 내용입니다.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">
                액션
              </Button>
              <Button variant="secondary" size="sm">
                취소
              </Button>
            </CardFooter>
          </Card>

          <Card interactive shadow="md">
            <CardHeader>
              <CardTitle>인터랙티브 카드</CardTitle>
              <CardDescription>hover 효과가 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <p>마우스를 올려보세요!</p>
            </CardContent>
          </Card>

          <Card padding="lg" shadow="lg">
            <CardTitle>큰 패딩 카드</CardTitle>
            <CardContent className="mt-4">
              <p>더 넓은 공간이 필요할 때 사용합니다.</p>
            </CardContent>
          </Card>

          <Card padding="sm">
            <p>작은 패딩 카드</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
