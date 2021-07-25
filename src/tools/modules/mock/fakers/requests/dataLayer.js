const dataLayer = options => {
    return {
        user: {
            type: 'sub',
            regiId: options.userId,
            watSegs: 'Cooking',
            nytdOtherData: {
                subscriptions: [{
                    bundle: 'XPASS',
                    source: 'Sartre',
                    promotion: 'promo',
                    grace: 'F',
                    campaign: '4XUYF',
                    hasTransactionInProgress: false
                }, {
                    bundle: 'CR',
                    source: 'Sartre',
                    promotion: 'promo',
                    grace: 'F',
                    campaign: '7UHY9',
                    hasTransactionInProgress: false
                }]
            },
            subscriptions: {
                activeBundles: ['Bundle '],
                subscriberType: 'Regular',
                activeSubscriberSince: 1511702102000,
                isNewsSubscriber: 1
            },
            propensity: {
                engagementLevel: 0
            },
            tracking: {
                lastRequest: Date.now() / 1000,
                activeDays: '[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]',
                uid: options.userId,
                adv: 30,
                a7dv: 7,
                a14dv: 14,
                a21dv: 21,
                lastKnownType: 'sub'
            },
            subscriberInfo: {
                coreSubscriptionTenure: '3 years',
                coreDigiBundle: 'Bundle XPASS (Basic Digital Access)',
                otherBundle: 'Bundle CR (The New York Times Games)',
                giftSubscriptionRecipient: false,
                childSubscription: false,
                b2bSubscription: false,
                coreOnPromotion: true,
                formerCoreSubscriber: false,
                formerHDSubscriber: false,
                formerEduSubscriber: false,
                marketingOptIn: false,
                retentionSegment: '0',
                cookingStopCode: 'Closed',
                formerCrosswordSubscriber: false,
                formerCookingSubscriber: true,
                watString: ',Cooking,SUBS_NOT_OPT_IN,',
                giftGiver: false,
                coreStartDate: 1511702102000,
                otherStartDate: 1552589827000,
                sasSegment: ',44062,44054,',
                digiGrace: false,
                topWat: 'Cooking',
                gatewayHitLM: false,
                cookingGrace: false,
                crosswordsGrace: false,
                coreOfferId: 20000130420,
                corePromoId: 10243,
                regiTenure: '3 years',
                engagementActiveDays: 7,
                condensedBundleCodes: ',CR,XPASS,',
                newsletterList: ',CR,NFN,NQ,',
                regiSourceName: 'nyt',
                coreEntitlementEndUtc: 1627834502000,
                verizonSchool: false
            },
            actioniq: {
                audience_split_ids: [
                    [172448, 1],
                    [211611, 1]
                ]
            },
            adv_scores: {
                audience_split_ids: []
            },
            adv_segments: {
                segments: [224, 262, 27, 225, 132630, 132316, 132666, 131953, 301, 295, 166841, 291, 132362, 132636, 272, 275, 278, 277, 273, 276, 221, 227, 226, 279, 219, 229, 282, 281, 266, 132640, 132674, 134203, 166843, 166842, 166845, 173594, 170215, 166844, 173595, 173597, 173600, 173598, 173602]
            }
        },
        version: 'v3-1-17.435853711877207864',
        asset: {
            wordCount: 0,
            url: 'https://spelling-bee.app/puzzles/spelling-bee',
            derivedDesk: ''
        },
        ip: {
            corp: null,
            edu: null
        },
        session: {
            isLoggedIn: true
        }
    }
}

export default dataLayer;