import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { mount } from '@vue/test-utils'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'

describe('Test TxApprovedMessagesbox Interface', () => {
    it('Test correct display', async () => {
        const wrapper = mount(TxApprovedMessageBox, {
            props: {
                reference: {
                    type: 'approved',
                    timestamp: new Date('1/15/2022'),
                    grouped_tx: [{
                        from: user_1,
                        grouped_id: 'abc',
                        state: 'approved',
                        txs: [{
                            to: user_2,
                            tx_id: 'abcd',
                            amount: 50
                        }, {
                            to: user_3,
                            tx_id: 'abce',
                            amount: 45
                        }],
                        describtion: 'Schnitzel',
                        timestamp: new Date('1/15/2022'),
                        pending_approvals: []
                    }]
                }    
            }
        })
        expect(wrapper.html()).toContain('1/15/2022')
        expect(wrapper.html()).toContain('Schnitzel')
        expect(wrapper.html()).toContain('DSN Test Account No 1 paid ' + '90')
    })
})