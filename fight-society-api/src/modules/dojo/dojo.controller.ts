import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { DojoService } from './dojo.service';
import { SaveDojoDescriptionDto } from './dto/dojo-description.dto';

@ApiTags('Dojo')
@ApiBearerAuth()
@Controller('dojo')
export class DojoController {
  constructor(private readonly dojoService: DojoService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get the dojo description' })
  find() {
    return this.dojoService.find();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create or replace the dojo description (Admin only)' })
  create(@Body() dto: SaveDojoDescriptionDto) {
    return this.dojoService.save(dto.description);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update the dojo description (Admin only)' })
  update(@Param('id') id: string, @Body() dto: SaveDojoDescriptionDto) {
    return this.dojoService.update(id, dto.description);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete the dojo description (Admin only)' })
  remove(@Param('id') id: string) {
    return this.dojoService.remove(id);
  }
}
