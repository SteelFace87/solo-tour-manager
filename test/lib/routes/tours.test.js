const Tour = require('../../../lib/Model/Tour');
const TourStop = require('../../../lib/Model/TourStop');
const mongoose = require('mongoose');

const tours = require('../../../lib/routes/tours');
const request = require('supertest');
const app = require('../../../lib/app');
const getWeather = require('../../../lib/services/weather');
jest.mock('../../../lib/services/weather.js');
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
                
                expect(created.body).toEqual({
                    title:'first tour',
                    activities: ['poledancing', 'trapese'],
                    date:date.toISOString(),
                    __v: 0,
                    _id: expect.any(String),
                    stops: []

                });
            });          
    });
    it('can get all tours', () => {
        return Tour.create(
            {
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            }
        )
            .then(()=>{
                return request(app)
                    .get('/api/v1/tours/')
                    .then(received=>{
                        expect(received.body.length).toEqual(1);
                    });
            });
    });
    it('can get a tour by id', () => {
        return Tour.create(
            {
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            })
            .then(created=>{
                const id = created.id;
                return request(app)
                    .get(`/api/v1/tours/${id}`)
                    .then(foundTours =>{
                        expect(foundTours.body).toEqual({
                            title:'first tour',
                            activities: ['poledancing', 'trapese'],
                            date:date.toISOString(),
                            stops:[]
                        });
                    });
              
            });
    });

    it('cant post a stop to a tour', () => 
    {
        return TourStop.create({
            location:'test',
            weather:'sunny',
            attendance:500
        })
            .then(createdTourStop=>{       
                const date = new Date;
                const tourStopId = createdTourStop._id;
                return Promise.all([
                    Tour.create({
                        title:'first tour', 
                        activities: ['poledancing', 'trapese'],
                        date:date,                  
                    }),
                    Promise.resolve(tourStopId)
                ])
                    .then(([createdTour, tourStopId])=>{       
                        const createdTourId = createdTour._id;
                        return request(app)
                            .post(`/api/v1/tours/${createdTourId}/stops`)
                            .send({ tourStopId });                
                    });
            })
            .then((updatedTour)=>{
                expect(updatedTour.body.stops[0]).toEqual({
                    _id:expect.any(String),
                    attendance:500,
                    weather: 'sunny'
                });
            });       
    });
    it('can delete a tour', ()=>{
        {
            return TourStop.create({
                location:'test',
                weather:'sunny',
                attendance:500
            })
                .then(createdTourStop=>{       
                    const date = new Date;
                    const tourStopId = createdTourStop._id;
                    return Promise.all([
                        Tour.create({
                            title:'first tour', 
                            activities: ['poledancing', 'trapese'],
                            date:date,                  
                        }),
                        Promise.resolve(tourStopId)
                    ])
                        .then(([createdTour, tourStopId])=>{       
                            const createdTourId = createdTour._id;
                            return request(app)
                                .post(`/api/v1/tours/${createdTourId}/stops`)
                                .send({ tourStopId });  
                                              
                        })
                        .then(()=>{
                            return request(app)
                            .delete(`/api/v1/tours/${createdTourId}/stops`)
                        })
                        
                })
    })
});
