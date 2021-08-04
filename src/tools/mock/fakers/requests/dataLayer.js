/**
 * Fake reply to
 * @param options
 * @returns {{session: {isLoggedIn: boolean}, ip: {corp: null, edu: null}, asset: {wordCount: number, derivedDesk: string, url: string}, user: {subscriptions: {activeBundles: string[], isNewsSubscriber: number, activeSubscriberSince: number, subscriberType: string}, propensity: {engagementLevel: number}, adv_scores: {audience_split_ids: *[]}, subscriberInfo: {formerCrosswordSubscriber: boolean, coreOnPromotion: boolean, coreDigiBundle: string, formerCookingSubscriber: boolean, gatewayHitLM: boolean, cookingGrace: boolean, cookingStopCode: string, corePromoId: number, engagementActiveDays: number, childSubscription: boolean, coreEntitlementEndUtc: number, formerCoreSubscriber: boolean, coreSubscriptionTenure: string, coreStartDate: number, digiGrace: boolean, condensedBundleCodes: string, b2bSubscription: boolean, topWat: string, crosswordsGrace: boolean, giftGiver: boolean, formerEduSubscriber: boolean, giftSubscriptionRecipient: boolean, newsletterList: string, formerHDSubscriber: boolean, verizonSchool: boolean, retentionSegment: string, otherStartDate: number, otherBundle: string, marketingOptIn: boolean, regiSourceName: string, watString: string, regiTenure: string, coreOfferId: number, sasSegment: string}, actioniq: {audience_split_ids: number[][]}, regiId: *, adv_segments: {segments: number[]}, nytdOtherData: {subscriptions: [{grace: string, hasTransactionInProgress: boolean, campaign: string, source: string, bundle: string, promotion: string}, {grace: string, hasTransactionInProgress: boolean, campaign: string, source: string, bundle: string, promotion: string}]}, type: string, watSegs: string, tracking: {activeDays: string, uid: *, adv: number, lastRequest: number, a7dv: number, lastKnownType: string, a14dv: number, a21dv: number}}, version: string}}
 */
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