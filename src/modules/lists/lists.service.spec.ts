import {Test, TestingModule} from '@nestjs/testing'
import {right} from '@sweet-monads/either'
import {ListsService} from './lists.service'
import {ListsRepo} from './lists.repository'

describe('ListsService', () => {
  let service: ListsService
  const listsRepo = {
    findSimilarList: jest.fn(),
    create: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListsService, ListsRepo]
    })
      .overrideProvider(ListsRepo)
      .useValue(listsRepo)
      .compile()

    service = module.get<ListsService>(ListsService)
  })

  it('should create new list if has no similar list title', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'

    listsRepo.findSimilarList.mockResolvedValueOnce(right(undefined))

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE)

    expect(result).toEqual(
      right({
        author_uid: TEST_UID,
        title: TEST_TITLE
      })
    )
  })

  it('should create new duplicate title if has one duplicate', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: TEST_TITLE
    }

    listsRepo.findSimilarList.mockResolvedValueOnce(right(MOCK_SIMILAR_LIST))

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE)

    expect(result).toEqual(
      right({
        author_uid: TEST_UID,
        title: `${TEST_TITLE} (1)`
      })
    )
  })

  it('should create next duplicate title if has many duplicates', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test (1)'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: TEST_TITLE
    }

    listsRepo.findSimilarList.mockResolvedValueOnce(right(MOCK_SIMILAR_LIST))

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE)

    expect(result).toEqual(
      right({
        author_uid: TEST_UID,
        title: `${TEST_TITLE} (2)`
      })
    )
  })

  it('should create next duplicate title for brokenlike duplicate title', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test (4)(2)'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: TEST_TITLE
    }

    listsRepo.findSimilarList.mockResolvedValueOnce(right(MOCK_SIMILAR_LIST))

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE)

    expect(result).toEqual(
      right({
        author_uid: TEST_UID,
        title: `${TEST_TITLE} (1)`
      })
    )
  })
})
