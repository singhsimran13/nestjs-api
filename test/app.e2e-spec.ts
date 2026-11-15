import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignUpDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    pactum.request.setDefaultTimeout(10000);
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Auth', () => {
    const dto: SignUpDto = {
      email: 'vlad@gmail.com',
      password: 'password',
    };

    // Sign UP
    describe('sign-up', () => {
      it('should throw an error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw an error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw an error if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should sign-up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    // Sign IN
    describe('sign-in', () => {
      it('should throw an error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw an error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw an error if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should sign-in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('user_access_token', 'access_token');
      });
    });
  });

  // User
  describe('User', () => {
    describe('Get Current User', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/user')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit Current User', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Vladimir',
          email: 'vlad.code@gmail.com',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });

  // Bookmarks
  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it('should  create bookmark', () => {
        const createBookmarkDto: CreateBookmarkDto = {
          title: 'First Bookmark',
          link: 'https://www.youtube.com/watch?v=zJSY8tbf_ys&pp=0gcJCccHAYcqIYzv',
        };

        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .withBody(createBookmarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should  get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200);
      });
    });

    describe('Get bookmark by id', () => {
      it('should  get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit bookmark by id', () => {
      it('should  edit bookmark by id', () => {
        const editBookmarkDto: EditBookmarkDto = {
          title: 'Edited First Bookmark',
          link: 'https://www.youtube.com/watch?v=zJSY8tbf_ys&pp=0gcJCccHAYcqIYzv',
        };

        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .withBody(editBookmarkDto)
          .expectStatus(200);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should  delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(204)
          .inspect();
      });
    });
  });
});
