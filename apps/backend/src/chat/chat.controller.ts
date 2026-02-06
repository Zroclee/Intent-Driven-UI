import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('car')
  async chat(@Query() createChatDto: CreateChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const generator = this.chatService.streamChat(
      createChatDto.query,
      createChatDto.thread_id,
    );

    try {
      for await (const chunk of generator) {
        res.write(chunk);
      }
    } catch (error) {
      console.error('Stream error:', error);
    } finally {
      res.end();
    }
  }

  @Get('multi')
  async chatMulti(@Query() createChatDto: CreateChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const generator = this.chatService.streamMultiChat(
      createChatDto.query,
      createChatDto.thread_id,
    );

    try {
      for await (const chunk of generator) {
        res.write(chunk);
      }
    } catch (error) {
      console.error('Stream error:', error);
    } finally {
      res.end();
    }
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }
}
