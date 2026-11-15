import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from '../config/env.keys';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get(EnvKeys.DATABASE_URL),
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // For e2e testing only
  cleanDb() {
    return this.$transaction(
      [this.bookmark.deleteMany(), this.user.deleteMany()],
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }
}
