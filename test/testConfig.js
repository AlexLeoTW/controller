const should = require('should');

const config = require('../lib/config');

describe('#checkMustField', () => {
  // 測試 checkMustField 只有單層，正確
  it('should check all must field', done => {

    should.doesNotThrow(() => {
      config.checkMustField({
        must1: 'must1',
        notMust1: 'notMust1',
        thisIsMust: 'thisIsMust'
      }, [
        'must1'
        ,'thisIsMust'
      ])
    })

    done()
  })

  // 測試 checkMustField 只有單層，錯誤
  it('should throw Error when fields missing', done => {

    should.throws(() => {
      config.checkMustField({
        must1: 'must1',
        notMust1: 'notMust1',
        // thisIsMust: 'thisIsMust'
      }, [
        'must1'
        ,'thisIsMust'
      ])
    })

    done()
  })

  // 測試 checkMustField 在雙層的時候(.)
  it('should check all must field (with .)', done => {

    should.doesNotThrow(() => {
      config.checkMustField({
        must1: 'must1',
        notMust1: 'notMust1',
        layerOne: {
          layer2must: 'layer2must',
          notImportant: 'notImportant'
        }
      }, [
        'must1'
        ,'layerOne.layer2must'
      ])
    })

    done()
  })

  // 測試 checkMustField 在雙層的時候(.)，錯誤
  it('should throw error when inner must fields not set (with .)', done => {

    should.throws(() => {
      config.checkMustField({
        must1: 'must1',
        notMust1: 'notMust1',
        layerOne: {
          // layer2must: 'layer2must',
          notImportant: 'notImportant'
        }
      }, [
        'must1'
        ,'layerOne.layer2must'
      ])
    })

    done()
  })
})
