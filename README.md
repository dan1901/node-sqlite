### API Document

| Url | Method | Params |Request| Response |
|--------|--------|--------|--------|--------|
|/users|GET|||id, email, type|
|/users|POST||email, password, type(0:user,1:driver)|회원가입 완료|
|/login|POST||email,password||
|/users/:id/allocations|POST||desc_address:목적지||
|/drivers/:id/allocations/:allocationId|PUT|||신청한 배차 요청건에 배차되었습니다.|
|/allocations|GET|statsu(0:배차요청,1:배차완료,2:운행완료,3:배차취소)||||

### Database Diagram


### 실행 및 환경
nodejs v11.14.0
npm v6.9.0
database sqlite3
express4
macos 10.14 Mojave
```
npm install
npm start
```

