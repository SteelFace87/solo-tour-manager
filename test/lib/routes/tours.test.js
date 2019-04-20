const Tour = require('../../../lib/Model/Tour');
const tours = require('../../../lib/routes/tours');
const request = require('supertest');
const app = require('../../../lib/app');
require('../data-helper');

describe('tours route', () => {
    const date = new Date;
    it('can post a tour', () => {
        return request(app)
            .post('/api/v1/tours')
            .send({
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            })
            .then(created => {
                console.log('created in est', created);
                expect(created.body).toEqual({
                    title:'first tour',
                    activities: ['poleancing', 'trapese'],
                    date:date      
                });
            });          
    });
})
;
