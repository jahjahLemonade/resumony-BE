import stripe from 'stripe'

const instance = stripe(
  'sk_test_51PPTq1P7QEN5uEyKV9ZZygCMaK0hGn0In9bY4scxOMOIZZAG0ddh5qsv2ZOrObrSdcPeMeJiX81c8ZkCd5kqFChF00BzrlS1bV',
)

instance.products
  .create({
    name: '12 Subscription',
    description: '$12/Month subscription',
  })
  .then(product => {
    instance.prices
      .create({
        unit_amount: 1200,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        product: product.id,
      })
      .then(price => {
        console.log(
          'Success! Here is your starter subscription product id: ' +
            product.id,
        )
        console.log(
          'Success! Here is your starter subscription price id: ' + price.id,
        )
      })
  })
