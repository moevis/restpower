# RestPower: a new way to write a http client

```typescript
import "reflect-metadata";
import { API, RestPower, Get, Header, Path, Post, Query, R } from "restpower";

@API({ prefix: "/api/user" })
class UserService extends RestPower {
  @Get("/profile")
  profile() {
    return R<{ name: string }>();
  }

  @Get("/{id}/profile")
  userProfile(@Path("id") _user_id: string) {
    return Promise.resolve({} as IResp);
  }

  @Get("/{0}/profile")
  userProfile2(_user_id: string) {
    return R<{ data: string }>();
  }

  @Get("/posts")
  posts(
    @Query("key") _key: string,
    @Query() _paginator: { pageSize: number; page: number }
  ) {
    return R<{}>();
  }

  @Post("/login")
  login(@Body() _user: IUser) {
    return R<{}>();
  }

  @Post("/any")
  anyRoute(
    @Body() _body: { name: string },
    @Query() _q: { age: number },
    @Header("tttt") _h: string
  ) {
    return R<{}>();
  }
}

interface IUser {
  user: string;
  password: string;
}

const service = new UserService();

service.userProfile("uid");
```
