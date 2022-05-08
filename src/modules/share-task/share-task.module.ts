import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {ShareTaskService} from './share-task.service'
import {SharedTaskModel} from './shared-task.model'
import {SharedTaskRepo} from './shared-task.repo'
import {ShareTaskController} from './share-task.controller'
import {TasksModule} from '../tasks/tasks.module'

@Module({
  imports: [ObjectionModule.forFeature([SharedTaskModel]), TasksModule],
  controllers: [ShareTaskController],
  providers: [ShareTaskService, SharedTaskRepo],
  exports: [ShareTaskService]
})
export class ShareTaskModule {}
