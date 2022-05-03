import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TasksModule} from '../tasks/tasks.module'
import {ShareTaskService} from './share-task.service'
import {SharedTaskModel} from './shared-task.model'
import {SharedTaskRepo} from './shared-task.repo'

@Module({
  imports: [ObjectionModule.forFeature([SharedTaskModel]), TasksModule],
  providers: [ShareTaskService, SharedTaskRepo],
  exports: [ShareTaskService]
})
export class ShareTaskModule {}
