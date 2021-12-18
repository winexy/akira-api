import {Test, TestingModule} from '@nestjs/testing'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import {ListsService} from './lists.service'
import {ListsRepo} from './lists.repository'

describe('ListsService', () => {
  let service: ListsService
  const listsRepo = {
    FindDuplicates: jest.fn(),
    FindExactTitle: jest.fn(),
    Create: jest.fn()
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

  it('should return new list if no duplicate', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'

    listsRepo.FindDuplicates.mockReturnValueOnce(TE.of([]))
    listsRepo.FindExactTitle.mockReturnValueOnce(TE.of(O.none))

    listsRepo.Create.mockImplementationOnce(
      (uid: string) => (title: string) => {
        return TE.of({
          author_uid: uid,
          title
        })
      }
    )

    const result = await service.Create(TEST_UID, TEST_TITLE)()

    expect(E.toUnion(result)).toEqual({
      author_uid: TEST_UID,
      title: TEST_TITLE
    })
  })

  it('should return new list if has has exact title', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'
    const MOCK_EXACT_TITLE = TEST_TITLE

    listsRepo.FindDuplicates.mockReturnValueOnce(TE.of([]))
    listsRepo.FindExactTitle.mockReturnValueOnce(
      TE.of(O.some(MOCK_EXACT_TITLE))
    )

    listsRepo.Create.mockImplementationOnce(
      (uid: string) => (title: string) => {
        return TE.of({
          author_uid: uid,
          title
        })
      }
    )

    const result = await service.Create(TEST_UID, TEST_TITLE)()

    expect(E.toUnion(result)).toEqual({
      author_uid: TEST_UID,
      title: `${TEST_TITLE} (1)`
    })
  })

  it('should return new duplicate title if has one duplicate', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'
    const DUPLICATE_POSTFIX = '(1)'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: `${TEST_TITLE} ${DUPLICATE_POSTFIX}`
    }

    listsRepo.FindDuplicates.mockReturnValueOnce(TE.of([MOCK_SIMILAR_LIST]))

    listsRepo.Create.mockImplementationOnce(
      (uid: string) => (title: string) => {
        return TE.of({
          author_uid: uid,
          title
        })
      }
    )

    const result = await service.Create(TEST_UID, TEST_TITLE)()

    expect(E.toUnion(result)).toEqual({
      author_uid: TEST_UID,
      title: `${TEST_TITLE} (2)`
    })
  })

  it('should return new duplicate title if has many duplicates', async () => {
    const TEST_UID = 'test-uid'

    listsRepo.FindDuplicates.mockReturnValueOnce(
      TE.of([
        {author_uid: TEST_UID, title: 'test (9)'},
        {author_uid: TEST_UID, title: 'test (10)'}
      ])
    )

    listsRepo.Create.mockImplementationOnce(
      (uid: string) => (title: string) => {
        return TE.of({
          author_uid: uid,
          title
        })
      }
    )

    const result = await service.Create(TEST_UID, 'test')()

    expect(E.toUnion(result)).toEqual({
      author_uid: TEST_UID,
      title: `test (11)`
    })
  })

  it('should create next duplicate title for brokenlike duplicate title', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test (4)(2)'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: TEST_TITLE
    }

    listsRepo.FindDuplicates.mockReturnValueOnce(TE.of([MOCK_SIMILAR_LIST]))

    listsRepo.Create.mockImplementationOnce(
      (uid: string) => (title: string) => {
        return TE.of({
          author_uid: uid,
          title
        })
      }
    )

    const result = await service.Create(TEST_UID, TEST_TITLE)()

    expect(E.toUnion(result)).toEqual({
      author_uid: TEST_UID,
      title: `${TEST_TITLE} (1)`
    })
  })
})
