﻿using AddTextToImage.Data.Context;
using AddTextToImage.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AddTextToImage.Data.Service
{
    ///<summary>
    /// Provides a basic implementation of the IRepository contract.
    ///</summary>
    public class Repository<T> : IRepository<T> where T : Entity, new()
    {
        protected readonly DbContext dbContext;

        ///<summary>
        /// Creates a new instance of the Repository class.
        ///</summary>
        public Repository(IDbContextFactory factory)
        {
            dbContext = factory.GetContext();
        }

        public T Get(int id)
        {
            var entity = dbContext.Set<T>().Find(id);
            return entity;
        }

        public virtual IQueryable<T> GetAll()
        {
            return dbContext.Set<T>();
        }

        public virtual IQueryable<T> GetAllWithInclude(string include)
        {
            return dbContext.Set<T>().Include(include);
        }

        public virtual IQueryable<T> GetAllWithInclude(string include1, string include2)
        {
            return dbContext.Set<T>().Include(include1).Include(include2);
        }

        public virtual IQueryable<T> Where(Expression<Func<T, bool>> predicate)
        {
            return dbContext.Set<T>().Where(predicate);
        }

        public T Add(T o)
        {
            dbContext.Set<T>().Add(o);
            return o;
        }

        public virtual void Delete(T o)
        {
            dbContext.Set<T>().Remove(o);

            dbContext.Entry(o).State = EntityState.Deleted;
        }

        public void SetStateModified(T o)
        {
            dbContext.Entry(o).State = System.Data.Entity.EntityState.Modified;
        }

        public void SetStateUnchanged(T o)
        {
            dbContext.Entry(o).State = System.Data.Entity.EntityState.Unchanged;
        }

        public void Save()
        {
            dbContext.SaveChanges();
        }
    }
}
