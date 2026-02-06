import { Injectable } from '@nestjs/common';
import { streamInvoke } from '../agents/agent_car';
import { streamInvoke as streamInvokeMulti } from '../agents/agent_multi';

@Injectable()
export class ChatService {
  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  streamChat(query: string, thread_id: string = 'default') {
    return streamInvoke(query, thread_id);
  }

  streamMultiChat(query: string, thread_id: string = 'default') {
    return streamInvokeMulti(query, thread_id);
  }
}
